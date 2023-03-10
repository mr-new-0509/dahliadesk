import { BASE_URL_OF_MAINNET_INDEX_EXPLORER } from "./constants";

/** Attribute following Open Sea's attributes format (https://docs.opensea.io/docs/metadata-standards#attributes). */
interface Arc69Attribute {
  trait_type: string;
  value: string;
}

interface Arc69Metadata {
  description: string;
  external_url: string;
  media_url: string;
  attributes?: Arc69Attribute[];
}

/** The Algo Explorer transaction properties this package uses. */
interface AlgoExplorerTransaction {
  "round-time": number;
  note: string;
}

/** Fetches and parses ARC69 metadata for Algorand NFTs. */
export class Arc69 {
  algoExplorerApiBaseUrl = BASE_URL_OF_MAINNET_INDEX_EXPLORER;

  constructor(explorerBaseUrl: string) {
    this.algoExplorerApiBaseUrl = explorerBaseUrl;
  }

  async fetch(assetId: number | string): Promise<Arc69Metadata | null> {
    // Fetch `acfg` transactions.
    const url = `${this.algoExplorerApiBaseUrl}/v2/transactions?asset-id=${assetId}&tx-type=acfg`;
    let transactions: AlgoExplorerTransaction[];
    try {
      transactions = (await fetch(url).then((res) => res.json())).transactions;
    } catch (err) {
      console.error(err);
      return null;
    }

    // Sort the most recent `acfg` transactions first.
    transactions.sort((a, b) => b["round-time"] - a["round-time"]);

    // Attempt to parse each `acf` transaction's note for ARC69 metadata.
    for (const transaction of transactions) {
      try {
        const noteBase64 = transaction.note;
        const noteString = atob(noteBase64)
          .trim()
          .replace(/[^ -~]+/g, "");
        const noteObject = JSON.parse(noteString);
        if (noteObject.standard === "arc69") {
          return noteObject;
        }
      } catch (err) {
        // Oh well...
      }
    }

    return null;
  }
}
