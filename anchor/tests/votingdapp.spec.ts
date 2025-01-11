import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey, VoteProgram} from '@solana/web3.js'
import {Votingdapp} from '../target/types/votingdapp'
import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

const IDL = require('../target/idl/votingdapp.json');


const votingAdd = new PublicKey("H9Pk8RhCbCAEcFJc9JtWAgLCJtTypNfddzGM5ppqoG34");


describe('votingdapp', () => {
  let context;
  let provider;
  anchor.setProvider(anchor.AnchorProvider.env());
  let votingprogram = anchor.workspace.Votingdapp as Program<Votingdapp>;

  beforeAll( async () =>{
    // context = await startAnchor("", [{name: "votingdapp" , programId: votingAdd}], []);//(path, extraprogs[], addedaccount[])
    // provider = new BankrunProvider(context);
    // votingprogram = new Program<Votingdapp>(
    //   IDL,
    //   provider,
    // );

  })
  it('Initialize poll', async () => {
    // jest.setTimeout(15000)

    await votingprogram.methods.initializePoll(
      new anchor.BN(1),
      "Why are u gay?",
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
    expect(poll.description).toEqual("Why are u gay?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
    // expect(poll.pollEnd.toNumber()).toEqual(0);
    // expect(poll.candidateAmt.toNumber()).toEqual(0);
  })

  it("initialize candidates", async() =>{
    await votingprogram.methods.initializeCands(
      "isGay",
      new anchor.BN(1),
      
    ).rpc();
    await votingprogram.methods.initializeCands(
      "isSuperGay",
      new anchor.BN(1),
      
    ).rpc();

    const [ayushAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le',8),Buffer.from("isGay")],
      votingAdd,
    );
    const ayushDets = await votingprogram.account.candidates.fetch(ayushAddress);
    console.log(ayushDets);
    expect(ayushDets.candVotes.toNumber()).toEqual(0);

    const [nigaymanAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le',8),Buffer.from("isSuperGay")],
      votingAdd,
    );
    const nigaymanDets = await votingprogram.account.candidates.fetch(nigaymanAddress);
    console.log(nigaymanDets);
    expect(nigaymanDets.candVotes.toNumber()).toEqual(0);

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le',8)],
      votingAdd,
    )

    const poll = await votingprogram.account.poll.fetch(pollAddress);

    console.log(poll.candidateAmt);

    // expect(poll.pollId.toNumber()).toEqual(1);
  })
  
  it("vote", async() =>{
    await votingprogram.methods.vote(
      "isGay",
      new anchor.BN(1),
    ).rpc();

    const [ayushAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le',8),Buffer.from("isGay")],
      votingAdd,
    );
    const ayushDets = await votingprogram.account.candidates.fetch(ayushAddress);
    console.log(ayushDets);
    expect(ayushDets.candVotes.toNumber()).toEqual(1);
  })
})
