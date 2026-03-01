export async function getNews() {
  try {
    // Mock news data for now - replace with actual news API integration
    const mockNews = [
      {
        id: '1',
        title: 'Bitcoin Mining Difficulty Adjusts',
        summary: 'Latest difficulty adjustment in Bitcoin network',
        url: 'https://example.com/news/1',
        publishedAt: new Date().toISOString(),
        source: 'Crypto News'
      },
      {
        id: '2', 
        title: 'Ethereum Staking Rewards Update',
        summary: 'Changes in Ethereum staking rewards structure',
        url: 'https://example.com/news/2',
        publishedAt: new Date().toISOString(),
        source: 'Blockchain News'
      }
    ];

    return mockNews;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
