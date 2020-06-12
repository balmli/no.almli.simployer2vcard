const fs = require('fs');
const csvParser = require('csv-parse');
const transform = require('stream-transform');
const vCardsJS = require('vcards-js');

const parser = csvParser({
    columns: true,
    delimiter: ';'
});

const transformer = transform((row, cb) => {
    const vCard = vCardsJS();
    const { firstName, middleName, lastName } = getName(row.Report);
    const phone = getPhone(row.Telefon);
    const email = getEmail(row['Elektronisk adresse']);
    if (phone && email !== 'drift+simployer.api@miles.no') {
        vCard.firstName = firstName;
        vCard.middleName = middleName;
        vCard.lastName = lastName;
        vCard.workEmail = email;
        vCard.workPhone = phone;
        const vCardText = vCard.getFormattedString();
        cb(null, vCardText);
    }
});

const writeStream = fs.createWriteStream('./ContactList.vcf', { encoding: "utf-8" });

fs.createReadStream('./ContactList.csv', { encoding: "binary" })
    .on('error', console.error)
    .pipe(parser)
    .pipe(transformer)
    .pipe(writeStream);

const getName = (text) => {
    const items = text.split(' ');
    if (items.length === 4) {
        return {
            firstName: items[0],
            middleName: items[1] + ' ' + items[2],
            lastName: items[3]
        }
    } else if (items.length === 3) {
        return {
            firstName: items[0],
            middleName: items[1],
            lastName: items[2]
        }
    } else if (items.length === 2) {
        return {
            firstName: items[0],
            middleName: '',
            lastName: items[1]
        }
    } else if (items.length === 1) {
        return {
            firstName: items[0],
            middleName: '',
            lastName: ''
        }
    }
};

const getEmail = (text) => {
    return text.split(' ')[0].replace(/ /gi, "");
};

const getPhone = (text) => {
    if (!text) {
        return
    }
    let phone = text.split('(M)')[0];
    phone = phone.replace(/ /gi, "");
    return phone.startsWith('+') ? phone : '+47' + phone;
};
