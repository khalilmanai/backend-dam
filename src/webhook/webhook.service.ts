// src/webhook/webhook.service.ts

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { TaskService } from '../tasks/tasks.service';
import { TaskStatus } from '../tasks/dto/create-task.dto'; // Import TaskStatus enum

@Injectable()
export class WebhookService {
  private readonly openAIApiKey = process.env.CHATGPT_API_KEY;
  private readonly logger = new Logger(WebhookService.name); // Initialize logger

  constructor(private readonly taskService: TaskService) {}

  /**
   * Process the GitHub commit payload.
   * @param payload - The webhook payload received from GitHub.
   * @returns A success message upon processing all commits.
   * @throws HttpException if processing fails.
   */
  async processCommit(payload: any): Promise<string> {
    try {
      const commits = payload.commits;

      for (const commit of commits) {
        const { message, author } = commit;

        // Extract taskId from commit message
        const taskId = this.extractTaskId(message);
        if (!taskId) {
          this.logger.warn(`No task ID found in commit message: "${message}"`);
          continue; // Skip commits without a task ID
        }

        // Determine task status using ChatGPT API
        const status = await this.getTaskStatusFromChatGPT(message);

        // Update the task in the database
        await this.taskService.updateTaskStatusByTaskId(taskId, { status });
        this.logger.log(
          `Task ${taskId} updated to status "${status}" by user ${author.name}.`,
        );
      }

      return 'Processed successfully';
    } catch (error) {
      this.logger.error('Error processing commit:', error.message);
      throw new HttpException(
        'Failed to process commit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Extract the task ID from the commit message.
   * @param message - The commit message.
   * @returns The extracted task ID or null if not found.
   */
  private extractTaskId(message: string): string | null {
    const match = message.match(/#TASK([a-fA-F0-9]{24})/);
    return match ? match[1] : null;
  }

  /**
   * Determine the task status by communicating with the ChatGPT API.
   * @param commitMessage - The commit message containing the task ID.
   * @returns The new status of the task as defined in TaskStatus enum.
   * @throws HttpException if communication with ChatGPT API fails or response is unexpected.
   */
  private async getTaskStatusFromChatGPT(commitMessage: string): Promise<TaskStatus> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Determine task status based on commit messages.',
            },
            {
              role: 'user',
              content: `The commit message is: "${commitMessage}". Respond with either "in progress" or "done". No additional words.`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.openAIApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.debug(`ChatGPT API Response: ${JSON.stringify(response.data)}`);

      // Validate response structure
      if (
        response.data &&
        response.data.choices &&
        response.data.choices.length > 0 &&
        response.data.choices[0].message &&
        response.data.choices[0].message.content
      ) {
        const rawStatus = response.data.choices[0].message.content.trim().toLowerCase();

        // Map raw status to TaskStatus enum
        if (rawStatus === 'in progress') {
          return TaskStatus.IN_PROGRESS;
        } else if (rawStatus === 'done') {
          return TaskStatus.DONE;
        } else {
          this.logger.error(`Unexpected status value from ChatGPT: "${rawStatus}"`);
          throw new Error('Unexpected response from ChatGPT');
        }
      } else {
        this.logger.error('Invalid response structure from ChatGPT API');
        throw new Error('Unexpected response structure from ChatGPT');
      }
    } catch (error) {
      this.logger.error(
        `Error communicating with ChatGPT API: ${error.response?.data?.error?.message || error.message}`,
      );
      throw new HttpException(
        'Failed to communicate with ChatGPT API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
