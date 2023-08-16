const fse = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
// async function saveDir(){
//     function getDvcDiff() {
//         const result = execSync('dvc diff', { encoding: 'utf8' });

//         // Split the result into lines
//         const lines = result.split('\n');

//         let added = [];
//         let modified = [];
//         let deleted = [];

//         let currentCategory = null;

//         lines.forEach(line => {
//             const trimmedLine = line.trim();

//             if (trimmedLine.startsWith('files summary')) {
//                 return; // Skip the "files summary" line
//             }

//             if (trimmedLine === 'Added:') {
//                 currentCategory = 'added';
//             } else if (trimmedLine === 'Modified:') {
//                 currentCategory = 'modified';
//             } else if (trimmedLine === 'Deleted:') {
//                 currentCategory = 'deleted';
//             } else if (currentCategory && trimmedLine) {
//                 switch (currentCategory) {
//                     case 'added':
//                         added.push(trimmedLine);
//                         break;
//                     case 'modified':
//                         modified.push(trimmedLine);
//                         break;
//                     case 'deleted':
//                         deleted.push(trimmedLine);
//                         break;
//                 }
//             }
//         });

//         return {
//             added,
//             modified,
//             deleted
//         };
//     }


//     function executeCommand(command) {
//         execSync(command, { encoding: 'utf8', stdio: 'inherit' });
//     }


//     function handleUntrackedFiles() {
//         // Get the list of untracked files from Git
//         let result = execSync('git ls-files --others --exclude-standard').toString();

//         // Split the result into an array of filenames
//         let untrackedFiles = result.trim().split('\n');

//         // Filter files if necessary, e.g., if you only want to add .csv files to DVC
//         let dataFiles = untrackedFiles.filter(file => file.endsWith('.csv'));

//         // Run `dvc add` on these files
//         dataFiles.forEach(file => {
//             execSync(`dvc add ${file}`);
//             execSync(`git add ${file}.dvc`);
//         });
//     }

//     // function handleAddedFiles(files) {
//     //     files.forEach(file => {
//     //         executeCommand(`dvc add ${file}`);
//     //         executeCommand(`git add ${file}.dvc`);
//     //     });
//     // }

//     function handleModifiedFiles(files) {
//         // The process of handling modified files in DVC is similar to adding them
//         files.forEach(file => {
//             executeCommand(`dvc add ${file}`);
//             executeCommand(`git add ${file}.dvc`);
//         });
//     }

//     async function handleDeletedFiles(files) {
//         files.forEach(file => {
//             executeCommand(`git rm ${file}.dvc`);
//             // No need to remove the actual data file since you've already deleted it
//             // If you haven't deleted it yet, you can also add: executeCommand(`rm ${file}`);

            
//         });
    
//     }

//     function commitAndPushChanges(message) {
//         executeCommand(`git commit -m "${message}"`);
//         executeCommand('dvc push');
//         executeCommand('git push');
//     }

//     // Get list of all files in directory recursively
//     async function getAllFiles(dirPath, arrayOfFiles = []) {
//         const files = await fse.readdir(dirPath);

//         for (let file of files) {
//             const absolute = path.join(dirPath, file);
//             if (await fse.stat(absolute).then(stat => stat.isDirectory())) {
//                 arrayOfFiles = await getAllFiles(absolute, arrayOfFiles);
//             } else {
//                 arrayOfFiles.push(absolute);
//             }
//         }

//         return arrayOfFiles;
//     }

//     async function untrackedFiles(directory) {
//     // 1. Get list of all files in directory
//     const allFiles = await getAllFiles(directory);

//     // 2. Get list of DVC tracked files
//     try {
//         const dvcFilesStr = execSync(`dvc list ${directory}`, { encoding: 'utf8' });
//         const dvcFiles = dvcFilesStr.split('\n').map(f => path.join(directory, f.trim()));

//         // 3. Filter out DVC tracked files from all files
//         return allFiles.filter(f => !dvcFiles.includes(f));
//     } catch (err) {
//         console.error("Error fetching DVC tracked files:", err.message);
//         return allFiles;  // If error, return all files
//     }
//     }

//     async function removeFromGitignore(content, filenames) {
//         // const lines = content.split('\n');
//         const newLines = content.filter(line => !filenames.includes(line.trim()));
//         return newLines.join('\n');
//     }

//     // Main function to clean gitignore
//     async function cleanGitignore(directory) {
//         try {
//             const filesToCheck = await untrackedFiles(directory);
//             await removeFromGitignore(filesToCheck, directory);
//         } catch (err) {
//             console.error("Error cleaning .gitignore:", err.message);
//         }
//     }

//     // Example usage
//     const directory = '/home/idore/dev/dvc_tests/dvc-test/data';  // Replace with your directory path
//     await cleanGitignore(directory);

//     // Use the functions based on the diff result:
//     const diffResult =  getDvcDiff();  // Assuming you have the getDvcDiff function from previous examples

//     handleDeletedFiles(diffResult.deleted);
//     handleUntrackedFiles();
//     // handleAddedFiles(diffResult.added);
//     handleModifiedFiles(diffResult.modified);


//     // After all files are processed, commit and push the changes
//     commitAndPushChanges("Updated data files");
//     console.log("done")
// }
// saveDir();







async function Stam(){
    async function getFilesInDir(directory){
        items = await fse.readdir(directory);
        return items;
    }
    async function readGitIgnore(directory){
        content = await fse.readFile(path.join(directory, '.gitignore'), 'utf-8');
        return content;
    }

    async function getDvcTracked(directory){
       

        const dvcFiles = fse.readdirSync(directory).filter(file => file.endsWith('.dvc'));
        
        let trackedFiles = [];
        
        for (const dvcFile of dvcFiles) {
            const content = fse.readFileSync(path.join(directory,dvcFile), 'utf8').split('\n');
            
            for (const line of content) {
                // Look for lines starting with path key in the outs section
                if (line.trim().startsWith('path:')) {
                    // Extracting path value and pushing to the list
                    trackedFiles.push(line.split('path:')[1].trim());
                }
            }
        }
        
            return trackedFiles;
    }
    async function getRemote(directory){
        const Remote = execSync(`git config --get remote.origin.url`, {directory, encoding:'utf8'})
        // const Remote = execSync(`dvc remote list`, { directory, encoding: 'utf8'});
        return Remote;
    }


    

    items = await getFilesInDir('/home/idore/dev/dvc_tests/dvc-test/data');
    gitignoreContent = await readGitIgnore('/home/idore/dev/dvc_tests/dvc-test/data');
    dvcTracked = await getDvcTracked('/home/idore/dev/dvc_tests/dvc-test/data');
    // remote = await getRemote('/home/idore/dev/dvc_tests/dvc-test/data');
    // remote = remote.split('\n');
    console.log("items: ", items);
    console.log("gitignore str content: ",gitignoreContent);
    lines = gitignoreContent.split('\n');
    console.log("gitignore array content: ",lines);
    console.log("dvc Tracked: ",dvcTracked);
    // console.log("remote: ",remote);

}

Stam()