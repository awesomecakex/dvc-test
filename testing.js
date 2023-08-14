const { execSync } = require('child_process');

function getDvcDiff() {
    const result = execSync('dvc diff', { encoding: 'utf8' });

    // Split the result into lines
    const lines = result.split('\n');

    let added = [];
    let modified = [];
    let deleted = [];

    let currentCategory = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine === 'Added:') {
            currentCategory = 'added';
        } else if (trimmedLine === 'Modified:') {
            currentCategory = 'modified';
        } else if (trimmedLine === 'Deleted:') {
            currentCategory = 'deleted';
        } else if (currentCategory && trimmedLine) {
            switch (currentCategory) {
                case 'added':
                    added.push(trimmedLine);
                    break;
                case 'modified':
                    modified.push(trimmedLine);
                    break;
                case 'deleted':
                    deleted.push(trimmedLine);
                    break;
            }
        }
    });

    return {
        added,
        modified,
        deleted
    };
}

const {added, modified, deleted} = getDvcDiff();
console.log(added);
console.log(modified);
console.log(deleted);