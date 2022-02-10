use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod myepicproject {
    use super::*;
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        // Get a reference to the account.
        let base_account = &mut ctx.accounts.base_account;
        // Initialize total_images.
        base_account.total_images = 0;
        Ok(())
    }

    pub fn add_image(ctx: Context<AddImage>)->ProgramResult{
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_images+=1;
        Ok(())
    }
}



// Attach certain variables to the StartStuffOff context.
#[derive(Accounts)]
pub struct StartStuffOff<'info> {
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}


#[derive(Accounts)]
pub struct AddImage<'info>{
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_images: u64,
}