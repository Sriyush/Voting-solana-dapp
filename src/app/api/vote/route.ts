
import {ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {Votingdapp} from '../../../../anchor/target/types/votingdapp'
import { BN, Program } from "@coral-xyz/anchor";
const IDL = require('../../../../anchor/target/idl/votingdapp.json');

export const OPTIONS = GET;
export async function GET(request: Request) {
  const actionMetadata : ActionGetResponse ={
    icon: "https://imgs.search.brave.com/6rxtr6HaRIMWNfklH4w2aWMcsh2TsxwYJYP25LrMHyU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM2/NzkzNDU5MC9waG90/by9wZWFudXQtYnV0/dGVyLXN3aXJscy5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/WTQzNk9hdVQwRnFF/OEFCM0VVa1ZqckVU/d3ZYOXkxOVhpSk45/S1ZWazBfST0",
    title: "Vote for Shiv's real gender.",
    description: "Vote between Gay and Super Gay.",
    label: "Vote mah nigga",
    links:{
      actions: [
        {
          label: "Vote for Shiv is Gay",
          href: "/api/vote?candidate=isGay",
          type: "transaction"
        },
        {
          label: "Vote for Shiv is super Gay",
          href: "/api/vote?candidate=isSuperGay",
          type: "transaction"
        }
      ]
    }
  };
    return Response.json(actionMetadata , {headers: ACTIONS_CORS_HEADERS});
  }

  export async function POST(request: Request) {
    const url = new URL(request.url);
    const vote = url.searchParams.get("candidate") as string;
    console.log(vote);
    if (vote !=="isGay" && vote !=="isSuperGay") {
      return new Response("Invalid Candidate", {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const program: Program<Votingdapp> = new Program(IDL, { connection });
  
    const body: ActionPostRequest = await request.json();
    let voter;
  
    try {
      voter = new PublicKey(body.account);
    } catch (error) {
      return new Response("Invalid public key", {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }
  
    const instruction = await program.methods.vote(vote, new BN(1)).accounts({
      signer: voter,
    }).instruction();
  
    const Blockhash = await connection.getLatestBlockhash();
  
    const tx = new Transaction({
      feePayer: voter,
      blockhash: Blockhash.blockhash,
      lastValidBlockHeight: Blockhash.lastValidBlockHeight,
    }).add(instruction);
    const response = await createPostResponse({
      fields: {
        transaction: tx,
      },
    });
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
  }
    