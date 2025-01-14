#![allow(clippy::result_large_err)]

use anchor_lang::{prelude::*, solana_program::system_program};

declare_id!("H9Pk8RhCbCAEcFJc9JtWAgLCJtTypNfddzGM5ppqoG34");

#[program]
pub mod votingdapp {

    use super::*;
    pub fn initialize_poll(ctx: Context<InitializePoll> , poll_id: u64 , description: String , poll_start: u64, poll_end: u64) -> Result<()>{
      let poll = &mut ctx.accounts.poll;
      poll.poll_id = poll_id;
      poll.description = description;
      poll.poll_start = poll_start;
      poll.poll_end = poll_end;
      poll.candidate_amt = 0;
      Ok(())
    }

    pub fn initialize_cands(ctx: Context<InitializeCands>, cand_name:String , _poll_id: u64) ->  Result<()>{
      
      let candidate = &mut ctx.accounts.candidate;
      let poll = &mut ctx.accounts.poll;
      poll.candidate_amt +=1;
      candidate.cand_name = cand_name;
      candidate.cand_votes = 0;
      Ok(())
    }

    pub fn vote(ctx: Context<Vote> , _cand_name:String ,_poll_id: u64) -> Result<()>{
      let candidate = &mut ctx.accounts.candidate;
      candidate.cand_votes +=1;
      msg!("Votes {}" , candidate.cand_votes);
      Ok(())
    }
  }
#[derive(Accounts)]
#[instruction(cand_name:String , poll_id:u64)]

#[account(mut)]
pub struct Vote<'info>{

  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump,

  )]
  pub poll: Account<'info, Poll>,
  #[account(
    mut,
    seeds = [poll_id.to_le_bytes().as_ref(), cand_name.as_bytes()],
    bump,

  )]
  pub candidate: Account<'info,Candidates>,
}

#[derive(Accounts)]
#[instruction(cand_name:String , poll_id:u64)]
pub struct InitializeCands<'info>{
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    mut,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump,

  )]
  pub poll: Account<'info, Poll>,
  #[account(
    init,

    payer = signer,
    space = 8 + Candidates::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref(), cand_name.as_bytes()],
    bump,

  )]
  pub candidate: Account<'info,Candidates>,
  pub system_program: Program<'info,System>
}

#[account]
#[derive(InitSpace)]
pub struct Candidates{
  #[max_len(50)]
  pub cand_name: String,
  pub cand_votes: u64,
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info>{
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    init,

    payer = signer,
    space = 8 + Poll::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump,

  )]
  pub poll: Account<'info, Poll>,
  pub system_program: Program<'info,System>
}

#[account]
#[derive(InitSpace)]
pub struct Poll{
  pub poll_id: u64,
  #[max_len(32)]
  pub description: String,
  pub poll_start: u64,
  pub poll_end: u64,
  pub candidate_amt: u64,
}