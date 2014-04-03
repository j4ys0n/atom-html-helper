(function() {
    //'use strict';

    module.exports = {
        active: false,
        self: {},
        activate: function() {
            self = this;
            atom.workspaceView.command( 'html-helper:closeElement', self.closeElement );
        },
        getCursorLine: function() {
            var lines = atom.workspace.activePaneItem.buffer.lines,
                lineIndex = atom.workspace.activePaneItem.buffer.markers.markers['1'].range.end.row,
                line = lines[lineIndex];
            return line;
        },
        closeElement: function() {
            var open = '<',
                close = '>',
                indexStart = -1,
                indexEnd = -1,
                linePos = 0,
                el,
                element,
                elementRegex,
                elCloseStr,
                lineIndex = atom.workspace.activePaneItem.buffer.markers.markers['1'].range.end.row;

            var line = self.getCursorLine();

            while( linePos < line.length ){
                indexStart = line.indexOf(open, linePos)+1;
                indexEnd = line.indexOf(close, indexStart);
                el = line.substring(indexStart, indexEnd);
                console.log(indexStart, indexEnd, el);
                elementRegex = '<('+el+')\\b[^>]*>(.*)</\\1>';
                element = line.match(elementRegex); //output ["<h1>TEST</h1>", "h1", "TEST", index: 12, input: "            <h1>TEST</h1><h3></h3><h2>"]
                if( element === null && indexStart !== -1 && indexEnd !== -1 ){
                    //remove properties/attributes if present
                    if( el.indexOf(' ') > 0 ){
                        el = el.split(' ')[0];
                    }
                    //close element
                    elCloseStr = '</' + el + '>';
                    //stop loop
                    linePos = line.length;
                    //insert closing tag
                    atom.workspace.activePaneItem.insertText( elCloseStr );
                    //move cursor
                    atom.workspace.activePaneItem.setCursorBufferPosition( [lineIndex, linePos] );
                }else if( indexStart === -1 ){
                    linePos = line.length;
                }else if( indexStart !== -1 && indexEnd === -1 ){
                    //element open tag not finished. finish it.
                    atom.workspace.activePaneItem.insertText( close );
                    linePos -= 1;
                    line = self.getCursorLine();
                }else{
                    //element closed, add length to linePos, try again
                    linePos = element.index + String(element[0]).length;
                }
            }
        }
    };



})();
