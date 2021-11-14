require("dotenv").config();

const fetch = require("cross-fetch");
var sleep = require("system-sleep");

const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

const api = "https://api2.splinterlands.com";


async function lookup(id, username) {
    let u = await username;

    bot.sendMessage(id, "🔍 Looking up: " + u + "\n" + "⏱ Please wait...").then(
        (m) => {
            sleep(3000);
            bot.deleteMessage(id, m.message_id);
        }
    );

    let dec = 0;

    try {
        let decBalance = await fetch(`${api}/players/balances?username=${u}`)
            .then((r) => r.json())
            .then((r) => r.find((x) => x.token === "DEC").balance);

        let spsBalance = await fetch(`${api}/players/balances?username=${u}`)
            .then((r) => r.json())
            .then((r) => r.find((x) => x.token === "SPS").balance);

        let stakedBalance = await fetch(`${api}/players/balances?username=${u}`)
            .then((r) => r.json())
            .then((r) => r.find((x) => x.token === "SPSP").balance);

        let creditsBalance = await fetch(
            `${api}/players/balances?username=${u}`
        )
            .then((r) => r.json())
            .then((r) => r.find((x) => x.token === "CREDITS").balance);

        dec += decBalance;

        let details = await fetch(`${api}/players/details?name=${u}`).then(
            (r) => r.json()
        );

        let oneDayAgo = new Date(Date.now() - 86400000);
        let battles = await fetch(`${api}/battle/history?player=${u}`)
            .then((r) => r.json())
            .then((r) =>
                r.battles.filter((x) => Date.parse(x.created_date) > oneDayAgo)
            );

        let bw = [0, 0];
        for (let battle of battles) {
            bw[0]++;
            if (battle.winner === u) {
                bw[1]++;
            }
        }

        let kda = `${bw[1]} / ${bw[0]} = ${((bw[1] / bw[0]) * 100).toFixed(
            2
        )}%`;

        let getLeague = details.league;

        function league() {
            if (getLeague == 0) {
                return "Novice";
            } else if (getLeague == 1) {
                return "Bronze 3";
            } else if (getLeague == 2) {
                return "Bronze 2";
            } else if (getLeague == 3) {
                return "Bronze 1";
            } else if (getLeague == 4) {
                return "Silver 3";
            } else if (getLeague == 5) {
                return "Silver 2";
            } else if (getLeague == 6) {
                return "Silver 1";
            } else if (getLeague == 7) {
                return "Gold 3";
            } else if (getLeague == 8) {
                return "Gold 2";
            } else if (getLeague == 9) {
                return "Gold 1";
            } else if (getLeague == 10) {
                return "Diamond 3";
            } else if (getLeague == 11) {
                return "Diamond 2";
            } else if (getLeague == 12) {
                return "Diamond 1";
            } else if (getLeague == 13) {
                return "Champion 3";
            } else if (getLeague == 14) {
                return "Champion 2";
            } else if (getLeague == 15) {
                return "Champion 1";
            }
        }

        let lookupResult =
            "Lookup Details: " +
            "\n" +
            "👤 User: " +
            u +
            "\n" +
            "⭐️ Rating: " +
            details.rating +
            "\n" +
            "⚡️ ECR: " +
            details.capture_rate.toString().slice(0, 2) +
            "." +
            details.capture_rate.toString().slice(2) +
            "%" +
            "\n" +
            "👊 Power: " +
            details.collection_power +
            "\n" +
            "⚔️ Battles: " +
            kda +
            "\n" +
            "🔥 Streak: " +
            details.current_streak +
            "\n" +
            "👑 League: " +
            league() +
            "\n" +
            "🔮 DEC: " +
            dec.toFixed(2) +
            "\n" +
            "💳 SPS: " +
            spsBalance.toFixed(2) +
            "\n" +
            "🔒 Staked SPS: " +
            stakedBalance +
            "\n" +
            "💰 Credits: " +
            creditsBalance;
        bot.sendMessage(id, lookupResult);
    } catch (e) {
        bot.sendMessage(
            id,
            "❌ Invalid User: " + u + "\n" + "❌ Or API Error!"
        ).then((m) => {
            sleep(3000);
            bot.deleteMessage(id, m.message_id);
        });
    }
}

bot.onText(/\/lookup/, (msg, u) => {
    var id = msg.chat.id;
    var u = u[1]
    lookup(id, u)
});

bot.onText(/\/start/, (msg) => {
    var id = msg.chat.id;
    text =
        "Welcome!" +
        "\n" +
        "Available Commands: /lookup [username]" +
        "\n" +
        "Enjoy!!!" +
        "\n" +
        "Discord: LostVoid#4293" +
        "\n" +
        "Accepting Donations: " +
        "\n" +
        "Hive: @lostvoid";
    bot.sendMessage(id, text);
});
