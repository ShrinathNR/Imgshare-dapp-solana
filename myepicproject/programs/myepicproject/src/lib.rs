use anchor_lang::prelude::*;

declare_id!("2PdpKUvetUDW7b8UtcvX42RLjm85VvVroXYZW5cU1mCd");

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

    pub fn add_image(ctx: Context<AddImage>, img_link:String, msg:String)->ProgramResult{
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;

        //building a struct 
        let meme_info = ItemStruct{
            img_link: img_link.to_string(),
            msg : msg.to_string(),
            user_address: *user.to_account_info().key,
        };
        base_account.img_list.push(meme_info);
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
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub img_link: String,
    pub msg : String,
    pub user_address: Pubkey,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_images: u64,
    pub img_list: Vec<ItemStruct>,
}