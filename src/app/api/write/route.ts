//@ts-nocheck
import {
  ActionPostResponse,
  createPostResponse,
  MEMO_PROGRAM_ID,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  Keypair,
} from "@solana/web3.js";
import "dotenv/config";
import bs58 from "bs58";
import { write } from "fs";
import { send } from "process";

// GET request handler
//const BASE_URL ="http://localhost:3000"
 const BASE_URL = "https://writeblink.hishubh.com";
export async function GET(request: Request) {
  const url = new URL(request.url);
  console.log("URL", url);
  const payload: ActionGetResponse = {
    icon: "https://github.com/aeyshubh/solana-write/blob/78044a37dea47f4e7adbf7530d6ca2447bb7e130/public/images/ins.png", // Local icon path
    label: "Write Text",
    title: "Inscribe text on Solana Forever",
    description:
      "Inscribe text on the Solana blockchain forever with 0 transaction fees.",
    links: {
      actions: [
        { label: "Write GM", href: `${BASE_URL}/api/write?text=GM` },
        { label: "Write WAGMI", href: `${BASE_URL}/api/write?text=WAGMI` },
        {
          label: "Write Anything", // button text
          href: `${BASE_URL}/api/write?text={TextToWrite}`, // button link
          parameters: [
            {
              name: "TextToWrite", // field name
              label: "Inscribe Text on-Chain", // text input placeholder
              required: true,
            },
          ],
        },
      ],
    },
  };
  const res = Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
  return res;
}

export const OPTIONS = GET; // OPTIONS request handler

// POST request handler
export async function POST(request: Request) {
  console.log("POST request received");
  const body: ActionPostRequest = await request.json();
  const requestUrl = new URL(request.url);
  let TextToWrite;
  if (requestUrl.searchParams.get("text")) {
    TextToWrite = requestUrl.searchParams.get("text")!;
  }
  console.log("TextToWrite", TextToWrite);
  const textToWrite: string = TextToWrite || "Hello, Solana!";
  let sender = new PublicKey(body.account);

  const connection = new Connection(clusterApiUrl("mainnet-beta"));

  const transaction = new Transaction().add(
    // note: `createPostResponse` requires at least 1 non-memo instruction
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000,
    }),
    {
      keys: [],
      data: Buffer.from(`${TextToWrite}`, "utf-8"),
      programId: new PublicKey(MEMO_PROGRAM_ID),
    }
  );
  transaction.feePayer = sender;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  transaction.lastValidBlockHeight = (
    await connection.getLatestBlockhash()
  ).lastValidBlockHeight;
  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: "Text Written!",
    },
  });

  const res = Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
  return res;
}

/* async function fetchMemo() {
    const wallet = fromKeypair.publicKey;
    let signatureDetail = await SOLANA_CONNECTION.getSignaturesForAddress(wallet);
    console.log('Fetched Memo: ', signatureDetail[0].memo);
} */
