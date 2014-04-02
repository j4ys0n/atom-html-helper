(function() {

    var concatPattern = /\s*[\s,|]+\s*/g;

    module.exports = {
        active: false,
        activate: function() {
            var self = this;
            atom.workspaceView.command( 'html-helper:closeElement', self.closeElement );
        },
        closeElement: function() {
            var self = this,
                lines = atom.workspace.activePaneItem.buffer.lines,
                lineIndex = atom.workspace.activePaneItem.buffer.markers.markers['1'].range.end.row,
                line = lines[lineIndex],
                open = '<',
                close = '>',
                indexStart = -1,
                indexEnd = -1,
                linePos = 0,
                el,
                element,
                elementRegex;

            while( linePos < line.length ){
                indexStart = line.indexOf(open, linePos)+1;
                indexEnd = line.indexOf(close, indexStart)
                el = line.substring(indexStart, indexEnd);
                elementRegex = '<('+el+')\\b[^>]*>(.*)</\\1>';
                element = line.match(elementRegex); //output ["<h1>TEST</h1>", "h1", "TEST", index: 12, input: "            <h1>TEST</h1><h3></h3><h2>"]
                if( element === null ){
                    //close element
                    elCloseStr = '</' + el + '>';
                    //stop loop
                    linePos = line.length;
                    //insert closing tag
                    atom.workspace.activePaneItem.insertText( elCloseStr );
                    //move cursor
                    atom.workspace.activePaneItem.setCursorBufferPosition( [lineIndex, linePos] );
                }else{
                    //element closed, add length to linePos, try again
                    linePos = element.index + String(element[0]).length;
                }
            }
        }
    };



})();
