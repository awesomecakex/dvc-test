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

        if (trimmedLine.startsWith('files summary')) {
            return; // Skip the "files summary" line
        }

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


function executeCommand(command) {
    execSync(command, { encoding: 'utf8', stdio: 'inherit' });
}


function handleUntrackedFiles() {
    // Get the list of untracked files from Git
    let result = execSync('git ls-files --others --exclude-standard').toString();

    // Split the result into an array of filenames
    let untrackedFiles = result.trim().split('\n');

    // Filter files if necessary, e.g., if you only want to add .csv files to DVC
    let dataFiles = untrackedFiles.filter(file => file.endsWith('.csv'));

    // Run `dvc add` on these files
    dataFiles.forEach(file => {
        execSync(`dvc add ${file}`);
        execSync(`git add ${file}.dvc`);
    });
}

function handleAddedFiles(files) {
    files.forEach(file => {
        executeCommand(`dvc add ${file}`);
        executeCommand(`git add ${file}.dvc`);
    });
}

function handleModifiedFiles(files) {
    // The process of handling modified files in DVC is similar to adding them
    handleAddedFiles(files);
}

function handleDeletedFiles(files) {
    files.forEach(file => {
        executeCommand(`git rm ${file}.dvc`);
        // No need to remove the actual data file since you've already deleted it
        // If you haven't deleted it yet, you can also add: executeCommand(`rm ${file}`);
    });
}

function commitAndPushChanges(message) {
    executeCommand(`git commit -m "${message}"`);
    executeCommand('dvc push');
    executeCommand('git push');
}

// Use the functions based on the diff result:
const diffResult = getDvcDiff();  // Assuming you have the getDvcDiff function from previous examples

handleDeletedFiles(diffResult.deleted);
handleUntrackedFiles();
handleAddedFiles(diffResult.added);
handleModifiedFiles(diffResult.modified);


// After all files are processed, commit and push the changes
commitAndPushChanges("Updated data files");
