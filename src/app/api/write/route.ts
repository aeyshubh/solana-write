import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse,
    createPostResponse,
  } from "@solana/actions";
  import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    Keypair
  } from "@solana/web3.js";
import 'dotenv/config';
import bs58  from "bs58";

  // GET request handler
  export async function GET(request: Request) {
    const url = new URL(request.url);
    const payload: ActionGetResponse = {
      icon: "/images/icon.png", // Local icon path
      title: "Inscribe text",
      description: "Inscribe text on the Solana blockchain",
      label: "Write Text",
      links: {
        actions: [
            {
                "label": "Write", // button text
                "href": "/api/write?text={textW}",
                "parameters": [
                  {
                    "name": "Write", // field name
                    "label": "Inscribe Text on-Chain" // text input placeholder
                  }
                ]
              }
        ],
      },
    };
    console.log("Payload",payload);
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  }
  
  export const OPTIONS = GET; // OPTIONS request handler
  
  // POST request handler
  export async function POST(request: Request) {
    const body: ActionPostRequest = await request.json();
   let header= await request.headers;
    const textToWrite:string = (header.get("text")) || "GMmm";
    console.log("Text to write:", textToWrite);
    console.log(textToWrite);
    let sender;
  
    try {
      sender = new PublicKey(body.account);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid account",
          },
        }),
        {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        }
      );
    }
    const FEEPAYERKeyString:string = process.env.FEE_PAYER;
    const FEEPAYER_privateKey = bs58.decode(FEEPAYERKeyString);
    const FEEPAYER_keypair = Keypair.fromSecretKey(FEEPAYER_privateKey);
    const FEEPAYER_publicKey = FEEPAYER_keypair.publicKey.toString();

    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  
    const transaction = new Transaction().add(
        ({
            keys: [{ pubkey: sender, isSigner: true, isWritable: true }],
            data: Buffer.from(textToWrite, "utf-8"),
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
          })
    );
    transaction.feePayer = new PublicKey(FEEPAYER_keypair.publicKey);
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.lastValidBlockHeight = (await connection.getLatestBlockhash()).lastValidBlockHeight;
  
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "Text Written!",
      },
    });
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  }
  