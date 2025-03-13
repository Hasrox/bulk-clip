import {
	promptChannelName,
	promptContent,
	promptContentType,
	promptDownload,
	promptClipDownloadType,
} from '../utils/prompts.js';
import API from '../api/index.js';
import { formatContent } from '../helpers/index.js';
import { Downloader } from '../lib/downloader.js';
import { logMessage, confirmTransformer } from '../utils/index.js';
import { confirm } from '@inquirer/prompts';
/*const handleExit = () => process.exit(0);
process.on('SIGINT', () => handleExit());
process.on('SIGTERM', () => handleExit());*/

// src/actions/start.js
export const initialAction = async () => {
	try {
	  const channel = await promptChannelName();
	  const infoChannel = await API.fetchChannel(channel);
	  const { username } = infoChannel.user;
	  const contentType = await promptContentType(username);
	  
	  // Handle clip download differently
	  if (contentType === 'Clip') {
		const downloadType = await promptClipDownloadType();
		
		// Inside the initialAction function, update the bulk download section:

		if (downloadType === 'bulk') {
			logMessage('Fetching all clips, this may take a while...', 'blue');
			const response = await API.fetchContentList(channel, contentType, true);
			const allClips = response.clips || [];
			
			if (!allClips || allClips.length === 0) {
			  logMessage('No clips found for this channel.', 'red');
			  return;
			}
			
			logMessage(`Found ${allClips.length} clips!`, 'green');
			const formattedContent = formatContent(allClips, contentType);
			const confirmDownload = await confirm({
			  message: `Ready to download all ${allClips.length} clips from ${username}?`,
			  default: true,
			  transformer: confirmTransformer,
			  theme: {
				prefix: logMessage('[?]', 'green'),
			  },
			});
	
	if (confirmDownload) {
	  let successCount = 0;
	  let failCount = 0;
	  
	  for (let i = 0; i < formattedContent.length; i++) {
		const clip = formattedContent[i];
		logMessage(`Downloading clip ${i+1}/${formattedContent.length}: ${clip.name}`, 'blue');
		
		try {
		  if (!clip.value) {
			logMessage(`Clip URL is missing for: ${clip.name}`, 'red');
			failCount++;
			continue;
		  }
		  
		  const downloadResult = await Downloader(true, clip.value, {
			name: `${username}_clip_${i+1}_${clip.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`,
		  });
		  
		  if (downloadResult.status) {
			successCount++;
			logMessage(downloadResult.message, 'green');
		  } else {
			failCount++;
			logMessage(`Failed to download clip: ${clip.name}`, 'red');
		  }
		} catch (error) {
		  failCount++;
		  logMessage(`Error downloading clip: ${error.message}`, 'red');
		}
		
		// Add a small delay between downloads to avoid overwhelming the server
		await new Promise(resolve => setTimeout(resolve, 1000));
	  }
	  
	  logMessage(`Bulk download completed! Successfully downloaded ${successCount} clips, ${failCount} failed.`, 'green');
	}
	
	return;
  }
	  }
	  
	  // Original flow for single clip or VOD
	  const contentList = await API.fetchContentList(channel, contentType);
	  const formattedContent = formatContent(contentList, contentType);
	  const content = await promptContent(formattedContent, contentType);
	  const confirmDownload = await promptDownload(contentType, username);
	  const statusDownload = await Downloader(confirmDownload, content);
	  console.log(statusDownload.message);
	} catch (error) {
	  if (error.name === 'ExitPromptError') {
		process.exit(0);
	  }
  
	  throw error;
	}
  };
