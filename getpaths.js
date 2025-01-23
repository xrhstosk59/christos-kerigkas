const fs = require('fs');
const path = require('path');

const getAllPaths = (dir) => {
    const files = fs.readdirSync(dir);
    let paths = [];
    files.forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Εξαίρεση για φακέλους
            if (!['node_modules', '.next', 'public'].includes(file)) {
                paths = paths.concat(getAllPaths(fullPath));
            }
        } else {
            paths.push(fullPath);
        }
    });
    return paths;
};

// Διαδρομές μόνο από "src" και αρχεία του root
const srcPaths = getAllPaths('./src');
const rootFiles = fs.readdirSync('./')
    .filter(file => fs.statSync(file).isFile()) // Ελέγχει αν είναι αρχείο
    .map(file => path.resolve(file)); // Επιστρέφει πλήρη paths

// Συνδυασμός των paths
const paths = [...srcPaths, ...rootFiles];

// Αποθήκευση στο paths.txt
fs.writeFileSync('paths.txt', paths.join('\n'));
console.log('Paths saved to paths.txt');
