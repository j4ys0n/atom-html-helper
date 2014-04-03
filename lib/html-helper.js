(function() {
    //'use strict';

    module.exports = {
        self: {},
        oDefaults: {
            noClose: ['script', 'hr', 'link', 'input', 'meta', 'embed', 'param', 'source'],
            selfClose: ['br', 'img']
        },
        debug: true,
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
        checkSelfClose: function( el ){
            if( self.oDefaults.selfClose.indexOf( el ) > -1 ){
                return true;
            }else{
                return false;
            }
        },
        checkNoClose: function( el ){
            if( self.oDefaults.noClose.indexOf( el ) > -1 ){
                return true;
            }else{
                return false;
            }
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
                elLen,
                lineIndex = atom.workspace.activePaneItem.buffer.markers.markers['1'].range.end.row,
                selfClose,
                noClose,
                cursorPos;

            var line = self.getCursorLine();

            while( linePos < line.length ){
                indexStart = line.indexOf(open, linePos)+1;
                indexEnd = line.indexOf(close, indexStart);
                //handle self-closing element
                if( line.indexOf('/') === indexEnd-1 ){
                    indexEnd -= 1;
                }
                el = line.substring(indexStart, indexEnd);
                elLen = el.length+2;
                //remove properties/attributes if present
                if( el.indexOf(' ') > 0 ){
                    el = el.split(' ')[0];
                }
                selfClose = self.checkSelfClose( el );
                noClose = self.checkNoClose( el );
                elementRegex = '<('+el+')\\b[^>]*>(.*)</\\1>';
                element = line.match(elementRegex); //output ["<h1>TEST</h1>", "h1", "TEST", index: 12, input: "            <h1>TEST</h1><h3></h3><h2>"]
                //check for elements that self-close
                if( element === null && selfClose ){
                    elementRegex = '<('+el+')\\b[^>]*/>';
                    element = line.match(elementRegex);
                }
                //check for elements that don't close
                if( element === null && noClose ){
                    elementRegex = '<('+el+')\\b[^>]*>';
                    element = line.match(elementRegex);
                }

                if( element === null && indexStart !== -1 && indexEnd !== -1 ){
                    //stop loop
                    linePos += elLen+1;
                    cursporPos = linePos-1;
                    if( !noClose && !selfClose ){
                        //close element
                        elCloseStr = '</' + el + '>';
                        //insert closing tag
                        atom.workspace.activePaneItem.insertText( elCloseStr );
                    }else if( selfClose ){
                        elCloseStr = '/';
                        atom.workspace.activePaneItem.setCursorBufferPosition( [lineIndex, indexEnd] );
                        atom.workspace.activePaneItem.insertText( elCloseStr );
                        cursorPos = linePos;
                    }
                    //move cursor FIX THIS
                    atom.workspace.activePaneItem.setCursorBufferPosition( [lineIndex, cursorPos] );
                }else if( indexStart === -1 ){
                    linePos = line.length;
                }else if( indexStart !== -1 && indexEnd === -1 ){
                    //element start tag not finished. finish it.
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
