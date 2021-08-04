const axios = require("axios")

class SteamDig {
    /**
     * Constructor of SteamDig class.<br />You need to specify your Steam API Key right there to prevent redundancy in your code
     * @param {string} apiKey Your Steam API Key (<strong>REQUIRED !</strong>)
     */
    constructor(apiKey)
    {
        this.apiKey = apiKey

        axios
            .get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=76561197960435530`)
            .catch(err => {
                if(err.response.status === 503) {
                    this.apiKey = undefined
                    throw new Error("SteamDig: Steam API is unavailable")
                } else {
                    this.apiKey = undefined
                    throw new Error("SteamDig: Steam API Key is invalid")
                }
            })
    }

    /**
     * Method to catch Steam user data account by the SteamUser API.
     * @param {string} steamId 
     * @returns {object} Steam User Account (SteamID, Username, Profile URL, Avatar URL, ...)
     */
    async getUser(steamId)
    {
        if(!this.apiKey) return
        if(!steamId) throw new Error("SteamDig: Steam ID need to be specified")

        const resp = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`)
            .catch(_ => {
                throw new Error("SteamDig: An error has occured")
            })

        if(!resp.data.response.players[0]) throw new Error("SteamDig: This SteamID doesn't exist")
        return resp.data.response.players[0]
    }

    /**
     * Method to catch Game of a User Account 
     * @param {string} steamId 
     * @returns {object} Steam User Games (with Game Name, Game ID and Game Play Time)
     */
    async getGames(steamId)
    {
        if(!this.apiKey) return
        if(!steamId) throw new Error("SteamDig: Steam ID need to be specified")

        const resp = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=true`)
            .catch(_ => {
                throw new Error("SteamDig: An error has occured")
            })

        let games = []
        resp.data.response.games.forEach(game => {
            games.push({
                id: game.appid,
                name: game.name,
                time: game.playtime_forever // Time in minutes
            })
        })

        return games
    }

    /**
     * Method to catch Game News
     * @param {string} gameId The Game ID for which you want to get the news
     * @param {integer} count The number of news you want to get (default: 3)
     * @param {integer} maxLength The maximum length of each news (default: 300)
     * @returns {object} News (with ID, Title, URL, Author, News Content and the Date)
     */
    async getNews(gameId, count = 3, maxLength = 300)
    {
        if(!this.apiKey) return
        if(!gameId) throw new Error("SteamDig: Game ID need to be specified")

        const resp = await axios.get(`http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${gameId}&count=${count}&maxLength=${maxLength}&format=json`)
            .catch(_ => {
                throw new Error("SteamDig: An error has occured")
            })

        let news = []
        resp.data.appnews.newsitems.forEach(article => {
            news.push({
                id: article.gid,
                title: article.title,
                url: article.url,
                author: article.author,
                content: article.contents,
                date: article.date
            })
        })
        if(news.length <= 0) throw new Error("SteamDig: No news for this game...")
        return news
    }

    /**
     * Method to catch a Steam Account friends
     * @param {string} steamId 
     * @returns {object} Steam Friends List (with SteamID, Relationship and since when they are friends)
     */
    async getFriends(steamId)
    {
        if(!this.apiKey) return
        if(!steamId) throw new Error("SteamDig: Steam ID need to be specified")

        const resp = await axios.get(`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${this.apiKey}&steamid=${steamId}&relationship=friend`)
            .catch(_ => {
                throw new Error("SteamDig: An error has occured")
            })

        return resp.data.friendslist.friends
    }

    /**
     * Method to check if two Steam Accounts are in relationship or not.
     * @param {string} firstId 
     * @param {string} secondId 
     * @returns {boolean} Are they friends or not ?
     */
    async areFriends(firstId, secondId)
    {
        if(!this.apiKey) return
        if(!firstId) throw new Error("SteamDig: Steam ID n°1 need to be specified")
        if(!secondId) throw new Error("SteamDig: Steam ID n°2 need to be specified")
        if(firstId === secondId) throw new Error("SteamDig: Can't check relationship for same account")

        const friends = await this.getFriends(firstId)
        if(!friends) return

        const acc = friends.find(el => el.steamid === secondId)
        return acc ? true : false
    }
}

module.exports = SteamDig