const fetch = require("node-fetch");
const express = require("express");
const app = express();

let latestCheck;
let cachedResults = {};

const itemRegex = new RegExp(
	/<td[ ]{0,}class="s[0-9]{2}"[ ]{0,}dir="ltr">([a-zA-Z]|[ ]){1,}<\/td><td[ ]{0,}class="s[0-9]{1,3}"[ ]{0,}dir="ltr">([\$]|[\,]|[0-9]){1,}/g
);
const nameReplaceRegex = new RegExp(
	/<td[ ]{0,}class="s[0-9]{2}"[ ]{0,}dir="ltr">/
);
const nameReplaceEnd = new RegExp(
	/<\/td><td[ ]{0,}class="s[0-9]{1,3}"[ ]{0,}dir="ltr">([\$]|[\,]|[0-9]){0,}/
);
const priceReplaceRegex = new RegExp(
	/<td[ ]{0,}class="s[0-9]{2}"[ ]{0,}dir="ltr">([a-zA-Z]|[ ]){1,}<\/td><td[ ]{0,}class="s[0-9]{1,3}"[ ]{0,}dir="ltr">/
);

const reloadList = () => {
	latestCheck = Date.now();
    console.log('reloading i think')
	return new Promise((resolve) => {
		fetch(
			"https://docs.google.com/spreadsheets/d/e/2PACX-1vQZ1Of4S9jAPpciFYiKqM2QOETl4AKyBmcGdjv9_ylyI1ZWxoY4JpIVi0H9vO2K1WFmsjckAXYFJFLd/pubhtml"
		)
			.then((res) => res.text())
			.then((body) => {
				const items = body.match(itemRegex);
				let count = 0;
				items.forEach((element) => {
					count++;
					const itemName = element
						.replace(nameReplaceRegex, "")
						.replace(nameReplaceEnd, "");
					const itemPrice = parseInt(element.replace(priceReplaceRegex, "").replace(/\D/g, ""));
					cachedResults[itemName] = itemPrice;

					if (count == items.length) {
						resolve();
					}
				});
			});
	});
};

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
	if (latestCheck == undefined ||  Date.now() - latestCheck > 10000) {
        reloadList().then(() => {
            res.json(cachedResults)
        })
    } else {
        res.json(cachedResults)
    }
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});