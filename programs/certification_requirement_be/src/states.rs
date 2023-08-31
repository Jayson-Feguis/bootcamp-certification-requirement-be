use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct UserProfile {
    pub user: Pubkey,
    pub games_played: u32,
}

#[account]
#[derive(Default)]
pub struct LeaderboardAccount {
    pub user: Pubkey,
    pub game: String,
    pub mode: String,
    pub point: u32,
    pub time: u32,
    pub guess: u32,
}
