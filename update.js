//-------------------------------------------------------------------
// Auto updates
//-------------------------------------------------------------------
// Modules to control application life and create native browser window
const {
    app
} = require('electron');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const notifier = require('node-notifier');
const opsys = process.platform;


var disk = "D:/";
var pathLocal = disk + "ProgrammeX86/ShoppingList";
var urlFeed = disk + "repos/shared.git";
var programmName = "ShoppingList";
var programmTypeWin = ".exe";
var programmPath = pathLocal + "/" + programmName + programmTypeWin;
let execOptions = {
    shell: 'C:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe',
    cwd: pathLocal
};
let icon = path.join(__dirname, 'assets/icons/png/update.png');

// check for Update
// Set global temporary directory for things like auto update downloads, creating it if it doesn't exist already.
app.whenReady().then(() => {
    if (opsys == "win32" || opsys == "win64") {
        getVersionProgrammWin();

    } else if (opsys == "darwin") {
        getVersionProgrammMac();

    } else if (opsys == "linux") {
        getVersionProgrammLinux();
    }

});





//-------------------------------------------------------------------
// AutoUpdate for windows 
//-------------------------------------------------------------------
function getVersionProgrammWin() {
    exec("(get-item " + programmName + programmTypeWin + ").VersionInfo.FileVersion",
        execOptions,
        function(stdout, stderr, error) {
            if (error) {
                console.log(error);
                autoupdaterWin("1.0.0");

            } else {
                autoupdaterWin(stderr);

            }
        })

};

function autoupdaterWin(versionProgramm) {
    try {
        fs.readFile(disk + 'update.json', (err, data) => {
            if (err) {
                app.quit();
            };
            let update = JSON.parse(data);
            var isExistNewversionFolder = pathLocal + "/" + programmName + '-' + update.version;
            notify(app.getName() + ' Update', 'Checking for update...');
            console.log(versionProgramm);
            console.log(update.version);
            if (update.version > versionProgramm) {
                notify(app.getName() + ' Update', 'Update available.');
                if (fs.existsSync(programmPath)) {
                    fs.unlinkSync(programmPath);
                    console.log("delete");
                }
                if (fs.existsSync(isExistNewversionFolder)) {
                    exec('Remove-Item ' + pathLocal + "/" + programmName + '-' + update.version + ' -Force -Recurse', execOptions);
                }
                exec('git clone ' + urlFeed + ' ' + programmName + '-' + update.version, execOptions, (err, stdout, stderr) => {
                    if (err) {
                        console.log('exec error: ' + err);
                        app.quit();
                    } else {
                        exec('Copy-Item ' + programmName + '-' + update.version + '/' + programmName + programmTypeWin + ' ' + pathLocal, execOptions,
                            (err, stdout, stderr) => {
                                if (err) {
                                    console.log('exec error: ' + err);
                                    app.quit();
                                } else {
                                    notify('Update downloaded; will install now');
                                    console.log('Update downloaded; will install now');
                                    exec('Remove-Item ' + programmName + '-' + update.version + ' -Force -Recurse', execOptions,
                                        (err, stdout, stderr) => {
                                            notify('Update available.');
                                            console.log('stdout: ' + stdout);
                                            console.log('stderr: ' + stderr);
                                            if (err) {
                                                console.log('exec error: ' + err);
                                                app.quit();
                                            } else {
                                                notify('start application');
                                                console.log('start application');
                                                exec('cd ' + pathLocal + ' && ' + programmName + programmTypeWin);
                                                app.quit();
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                });
            } else {
                console.log(app.getName() + ' Update', 'It is up to date 🎉✨');
                exec('cd ' + pathLocal + ' && ' + programmName + programmTypeWin,
                    (err, stdout, stderr) => {
                        if (err !== null) {
                            console.log('exec error: ' + err);
                            app.quit();
                        } else {
                            app.quit();
                        }
                    }
                );
                notify(app.getName() + ' Update', 'It is up to date 🎉✨');
                app.quit();
            }
        });
    } catch (e) {
        notify(`No dice: ${e.message}`);
        app.quit()
    }

}


//-------------------------------------------------------------------
// node-notifier is a library for sending cross-platform native notifications in Node JS.
//-------------------------------------------------------------------
function notify(msg) {
    notifier.notify({
        title: programmName + ' Update',
        message: msg,
        icon: icon
    });
}

//-------------------------------------------------------------------
// window-all-closed
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
//-------------------------------------------------------------------
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})