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
    // ... rest of the bulk download code
  }
}
