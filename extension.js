// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const diff = require('diff')
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function is_svn_file(file_name){ 
    if(/^r\d{6}\_(.+)$/.test(file_name)){ 
        return true;
    }
	return false;
}
const createDiffCounter = () => {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);

    return {
        update: () => {
            const activeEditor = vscode.window.activeTextEditor;

            if (!activeEditor) {
                statusBarItem.hide();
                return;
            }

			let editors = vscode.window.visibleTextEditors
			if(editors.length!=2){
				console.log('不是2个文件')
				statusBarItem.hide();
				return false;
			}
			//计算差异
			var left = editors[0];
			var right = editors[1];
			var left_path = left.document.uri.fsPath;
			var right_path = right.document.uri.fsPath;
			var left_pos = left_path.lastIndexOf('/');
			var right_pos = right_path.lastIndexOf('/');
			var left_name = left_path.substring(left_pos+1);
			var right_name = right_path.substring(right_pos+1)
			if(!is_svn_file(left_name)||!is_svn_file(right_name)){
				console.log('不是svn文件')
				statusBarItem.hide();
				return false;
			}
			let left_text = left.document.getText()
			let right_text = right.document.getText()
			//对比
			// const diff_arr = diff.diffLines(left_text, right_text, false, true);
			const diff_arr = diff.diffTrimmedLines(left_text, right_text);
			// console.log(diff_arr)
			var count_added = 0;
			var count_removed = 0;
			// console.log(diff_arr)
			for(let key in diff_arr){
				if(diff_arr[key].added){
					count_added ++;
				}
				if(diff_arr[key].removed){
					count_removed ++;
				}
			}
			statusBarItem.text = `${count_added} added ${count_removed} removed`;

            statusBarItem.show();
        },
        dispose: () => {
            statusBarItem.dispose();
        }
    };
};

const createDiffCounterController = () => {
    const diffCounter = createDiffCounter();
    diffCounter.update();

    const eventDisposable = vscode.Disposable.from([
        vscode.window.onDidChangeActiveTextEditor(diffCounter.update),
        vscode.window.onDidChangeTextEditorSelection(diffCounter.update)
    ]);

    return {
        dispose: () => {
            diffCounter.dispose();
            eventDisposable.dispose();
        }
    };
};
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "diff-count" is now active!');

    const controller = createDiffCounterController();

    context.subscriptions.push(controller);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
