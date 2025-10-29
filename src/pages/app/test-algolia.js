import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { searchBox, hits } from 'instantsearch.js/es/widgets';
import 'instantsearch.css/themes/satellite-min.css';

// Initialize the Algolia client
const searchClient = algoliasearch(
  'CZ13W7HFT4',
  '049015a3cf5e98d32ebed63d7aa83b10'
);

const Search = () => {
  useEffect(() => {
    const search = instantsearch({
      indexName: 'movie',
      searchClient,
    });

    // Add widgets
    search.addWidgets([
      searchBox({
        container: '#searchbox',
        placeholder: 'Search for movies...',
      }),
      hits({
        container: '#hits',
        templates: {
          item: (hit) => `
            <div class="hit-item">
              ${hit.backdrop_path ? 
                `<img src="${hit.backdrop_path}" alt="${hit.title}" />` 
                : ''
              }
              <div class="hit-content">
                <h2>${hit.title}</h2>
                <p>${hit.overview}</p>
              </div>
            </div>
          `,
        },
      }),
    ]);

    // Start the search
    search.start();

    // Cleanup on unmount
    return () => search.dispose();
  }, []);

  return (
    <div className="search-container">
      <style jsx>{`
        .search-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        :global(.hit-item) {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }
        :global(.hit-item img) {
          max-width: 200px;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        :global(.hit-content h2) {
          margin: 0 0 10px 0;
          font-size: 1.2em;
          color: #333;
        }
        :global(.hit-content p) {
          margin: 0;
          color: #666;
          line-height: 1.5;
        }
        :global(.ais-SearchBox) {
          margin-bottom: 20px;
        }
        :global(.ais-SearchBox-input) {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
      `}</style>
      <div id="searchbox" />
      <div id="hits" />
    </div>
  );
};

export default Search;