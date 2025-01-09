import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey, VoteProgram} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp'
import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

const IDL = require('../target/idl/votingdapp.json');


const votingAdd = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");


let context;
let provider;
let votingprogram: Program<Votingdapp>;
describe('votingdapp', () => {

  beforeAll( async () =>{
    context = await startAnchor("", [{name: "votingdapp" , programId: votingAdd}], []);//(path, extraprogs[], addedaccount[])
    provider = new BankrunProvider(context);
    votingprogram = new Program<Votingdapp>(
      IDL,
      provider,
    );

  })
  it('Initialize poll', async () => {
    // jest.setTimeout(15000)

    await votingprogram.methods.initializePoll(
      new anchor.BN(1),
      "What are u gay?",
      new anchor.BN(0),
      new anchor.BN(1736355003),
      
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le',8)],
      votingAdd,
    )

    const poll = await votingprogram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What are u gay?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
    // expect(poll.pollEnd.toNumber()).toEqual(0);
    // expect(poll.candidateAmt.toNumber()).toEqual(0);
  })

  it("initialize candidates", async() =>{
    await votingprogram.methods.initializeCands(
      "Nigayman",
      new anchor.BN(1),
      
    ).rpc();
    await votingprogram.methods.initializeCands(
      "Ayush",
      new anchor.BN(1),
      
    ).rpc();

    const [ayushAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le',8),Buffer.from("Ayush")],
      votingAdd,
    );
    const ayushDets = await votingprogram.account.candidates.fetch(ayushAddress);
    console.log(ayushDets);
    expect(ayushDets.candVotes.toNumber()).toEqual(0);

    const [nigaymanAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le',8),Buffer.from("Nigayman")],
      votingAdd,
    );
    const nigaymanDets = await votingprogram.account.candidates.fetch(nigaymanAddress);
    console.log(nigaymanDets);
    expect(nigaymanDets.candVotes.toNumber()).toEqual(0);

  })
  
  it("vote", async() =>{
    await votingprogram.methods.vote(
      "Ayush",
      new anchor.BN(1),
    ).rpc();

    const [ayushAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le',8),Buffer.from("Ayush")],
      votingAdd,
    );
    const ayushDets = await votingprogram.account.candidates.fetch(ayushAddress);
    console.log(ayushDets);
    expect(ayushDets.candVotes.toNumber()).toEqual(1);
  })
})
