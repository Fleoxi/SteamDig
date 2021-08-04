const SteamDig = require("./index")
const steam = new SteamDig("2381E5E13B0CF1253CF3BE290A2D3D76")

async function test()
{
    const fr = await steam.getUser("76561198066134593")
    console.log(fr)
}

test()