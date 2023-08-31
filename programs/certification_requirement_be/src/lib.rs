use anchor_lang::prelude::*;

declare_id!("76ksujnwvqsPq2V9gfKYgRn1adzw4XifKncbstfSxLCb");

pub mod states;
pub mod constant;

use crate::{states::*, constant::*};

#[program]
mod certification_requirement_be {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        // Initialize user profile with default data
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.user = ctx.accounts.user.key();
        user_profile.games_played = 0;

        Ok(())
    }

    pub fn add_leaderboard(
        ctx: Context<AddLeaderboard>,
        game: String,
        mode: String,
        point: u32,
        time: u32,
        guess: u32,
    ) -> Result<()> {
        let leaderboard_account = &mut ctx.accounts.leaderboard_account;
        let user_profile = &mut ctx.accounts.user_profile;
        leaderboard_account.user = ctx.accounts.user.key();
        leaderboard_account.game = game;
        leaderboard_account.mode = mode;
        leaderboard_account.point = point;
        leaderboard_account.time = time;
        leaderboard_account.guess = guess;
        user_profile.games_played = user_profile.games_played.checked_add(1).unwrap();

        msg!("Data submitted!");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction()]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [USER_TAG, user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + std::mem::size_of::<UserProfile>(),
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction()]
pub struct AddLeaderboard<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_TAG, user.key().as_ref()],
        bump,
        has_one = user,
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(
        init, 
        seeds = [LEADERBOARD_TAG, user.key().as_ref(), &[user_profile.games_played as u8].as_ref()], 
        bump,
        payer = user,
        space = std::mem::size_of::<LeaderboardAccount>() + 8)]
    pub leaderboard_account: Box<Account<'info, LeaderboardAccount>>,

    pub system_program: Program<'info, System>,
}