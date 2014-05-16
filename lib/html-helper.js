(function() {
    //'use strict';

    module.exports = {
        self: {},
        oDefaults: {
            noClose: ['hr', 'link', 'input', 'meta', 'embed', 'param', 'source'],
            selfClose: ['br', 'img']
        },
        debug: true,
        activate: function(){
            self = this;
            atom.workspaceView.command( 'html-helper:closeElement', self.closeElement );
        },
        getCursorLine: function(){
            /*var lines = atom.workspace.activePaneItem.buffer.lines,
                lineIndex = atom.workspace.activePaneItem.buffer.markers.markers['1'].range.end.row,
                line = lines[lineIndex];*/
            var editor = atom.workspaceView.getActiveView().getEditor(),
                line;
            editor.moveCursorToBeginningOfLine();
            editor.selectToEndOfLine();
            line = editor.getSelectedText();
            editor.moveCursorToEndOfLine();
            return line;
        },
        replaceCursorLine: function( line ){
            var editor = atom.workspaceView.getActiveView().getEditor();
            editor.moveCursorToBeginningOfLine();
            editor.selectToEndOfLine();
            editor.delete();
            editor.insertText( line );
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
        checkElementComplete: function( el ){
            el = el.match(/<([A-Za-z0-9]+){1}(?:[\s]*)(?:[\d\w\s="-\.;\/]*)>/g);
            if( el === null ){
                return false;
            }else{
                el = el[0];
                if( el.substring( 0, 1 ) === '<'
                    && el.substring( 1, 2 ) !== '<'
                    && el.substring( el.length-1, el.length ) === '>' ){
                    return true;
                }else{
                    return false;
                }
            }
        },
        checkElements: function( line ){
            var reClosedG = /<([A-Za-z0-9]+){1}(?:[A-Za-z0-9\s="-\.;_%\!]*)>(.*)<\/\1>/g, //match any closed element
                reOpenG = /(?:<([A-Za-z0-9]+){1}[\s]*)(?:[^<]*)/g, //match all elements until the next, regardless of close
                reNoCloseG = /<([A-Za-z0-9]+){1}(?:[\s]*)(?:[\d\w\s="-\.;]*)>(?!<\/\1>)/g, //match any element that doesnt (or without) close
                reSelfCloseG = /<([A-Za-z0-9]+){1}(?:[\s]*)(?:[A-Za-z0-9\s="-\.;_%\!]*)\/>/g, //match any element that self-closes
                openResult,
                closedResult,
                noCloseResult,
                selfCloseResult,
                closedFound = [],
                noCloseFound = [],
                selfCloseFound = [],
                startTime = Date.now(),
                endTime,
                elapsedTime,
                i = 0,
                j = 0;

            openResult = line.match(reOpenG);
            console.log('---- initial matching');
            console.log(openResult);
            if( openResult !== null ){
        //CHECK FOR ELEMENTS THAT ARE ALREADY CLOSED AND REMOVE FROM ARRAY
                closedResult = line.match(reClosedG);
                console.log('---- closed elements matched');
                console.log('closedResult',closedResult);
                if( closedResult !== null ){
                    for( i = 0; i < openResult.length; i++ ){
                        for( j = 0; j < closedResult.length; j++ ){
                            if( closedResult[j].indexOf( openResult[i] ) > -1 && self.checkElementComplete( openResult[i] ) ){
                                console.log('**found', openResult[i] );
                                closedFound.push(i);
                                j = closedResult.length;
                            }
                        }
                    }
                    //console.log(closedFound);
                    for( i = 0; i < closedFound.length; i++ ){
                        //console.log(openResult[ closedFound[i]-i ]);
                        openResult.splice( closedFound[i]-i, 1 );
                    }
                    console.log('---- closed elements removed');
                    console.log( openResult );
                }
        //CHECK FOR ELEMENTS THAT SELF-CLOSE AND REMOVE FROM ARRAY
                if( openResult.length > 0 ){
                    selfCloseResult = line.match(reSelfCloseG);
                    console.log('---- self-closing elements matched');
                    console.log('selfCloseResult',selfCloseResult);
                    if( selfCloseResult !== null ){
                        for( i = 0; i < openResult.length; i++ ){
                            for( j = 0; j < selfCloseResult.length; j++ ){
                                if( selfCloseResult[j].indexOf( openResult[i] ) > -1 && self.checkElementComplete( openResult[i] ) ){
                                    console.log('**found', openResult[i] );
                                    selfCloseFound.push(i);
                                    j = selfCloseResult.length;
                                }
                            }
                        }
                        for( i = 0; i < selfCloseFound.length; i++ ){
                            openResult.splice( selfCloseFound[i]-i, 1 );
                        }
                        console.log('---- self closing elements removed');
                        console.log( openResult );
                    }
                }
        //CHECK FOR ELEMENTS THAT DO NOT CLOSE
                if( openResult.length > 0 ){
                    var scrub = [];
                    noCloseResult = line.match(reNoCloseG);
                    console.log('---- non-closing elements matched');
                    //console.log( noCloseResult );
                    //scrub closed elements from noCloseResult
                    if( noCloseResult !== null ){
                        if( closedResult !== null ){
                            for( i = 0; i < noCloseResult.length; i++ ){
                                for( j = 0; j < closedResult.length; j++ ){
                                    if( closedResult[j].indexOf( noCloseResult[i] ) > -1 ){
                                        console.log('**scrubbed', noCloseResult[i] );
                                        scrub.push(i);
                                    }
                                }
                            }
                            if( scrub.length > 0 ){
                                for( i = 0; i < scrub.length; i++ ){
                                    noCloseResult.splice( scrub[i]-i, 1 );
                                }
                            }
                            console.log('---- scrubbed elements that are actually closed');
                            console.log('noCloseResult', noCloseResult );
                        }
                        if( noCloseResult.length > 0 ){
                            for( i = 0; i < openResult.length; i++ ){
                                for( j = 0; j < noCloseResult.length; j++ ){
                                    if( noCloseResult[j].indexOf( openResult[i] ) > -1 && self.checkElementComplete( openResult[i] ) ){
                                        var ele = String(openResult[i]).substring(1);
                                        if( ele.indexOf(' ') > -1 ){
                                            ele = ele.substring(0, ele.indexOf(' '));
                                        }
                                        if( self.checkNoClose( ele ) ){
                                            console.log('**found', openResult[i] );
                                            noCloseFound.push(i);
                                            j = noCloseResult.length;
                                        }
                                    }
                                }
                            }
                            for( i = 0; i < noCloseFound.length; i++ ){
                                openResult.splice( noCloseFound[i]-i, 1 );
                            }
                        }
                        console.log('---- non-closing elements removed');
                        console.log( openResult );
                    }
                }
                console.log('---- elements that are not closed');
                console.log( openResult );
                endTime = Date.now();
                elapsedTime = (endTime - startTime)/1000;
                console.log('---- completed in '+elapsedTime+' seconds');
            }
            return openResult;
        },
        closeElement: function(){
            var line = self.getCursorLine(),
                result = self.checkElements( line ),
                i = 0;

            if( result !== null ){
        //CLOSE ELEMENTS THAT ARE OPEN
                for( i = 0; i < result.length; i++ ){
                    var rpl = new RegExp( '('+result[i]+')(?!.*>)', 'g' ),
                        ele = String(result[i]).substring(1),
                        rplStr;
                    console.log( 'replace:', rpl.exec(line) );
                    if( rpl.exec( line ) === null ){
                        rpl = new RegExp( '('+result[i]+')', 'g' );
                        console.log( 'replace:', rpl.exec(line) );
                    }
                    if( ele.indexOf(' ') > -1 ){
                        ele = ele.substring(0, ele.indexOf(' '));
                    }else if( ele.indexOf('>') > -1 ){
                        ele = ele.substring(0, ele.indexOf('>'));
                    }
                    console.log( ele );
                    if( self.checkSelfClose( ele ) ){
                        rplStr = '$1/>';
                    }else if( self.checkNoClose( ele ) ){
                        if( String(result[i]).indexOf('>') > -1 ){
                            return false;
                        }
                        rplStr = '$1>';
                    }else if( self.checkElementComplete( '<'+ele+'>' ) && String(result[i]).indexOf('>') > -1 ){
                        rplStr = '$1</'+ele+'>';
                    }else{
                        rplStr = '$1></'+ele+'>';
                    }
                    if( rplStr.match(/>/g).length > 1 ){
                        rplStr = rplStr.substring(0, rplStr.indexOf('>')+1);
                    }
                    line = line.replace( rpl, rplStr );
                }
                console.log( line );
                self.replaceCursorLine( line );
            }
        }
    };
})();
