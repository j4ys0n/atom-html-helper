{WorkspaceView} = require 'atom'
HtmlHelper = require '../lib/html-helper'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "html helper", ->
  [activationPromise, editor, editorView] = []

  closeElement = (callback) ->
      editorView.trigger "html-helper:closeElement"
      waitsForPromise -> activationPromise
      runs(callback)

  beforeEach ->
    atom.workspaceView = new WorkspaceView
    atom.workspaceView.openSync()

    editorView = atom.workspaceView.getActiveView()
    editor = editorView.getEditor()

    activationPromise = atom.packages.activatePackage('html-helper')

  describe "when the html-helper:closeElement event is triggered", ->
    it "attaches and then detaches the view", ->
      expect(atom.workspaceView.find('.html-helper')).not.toExist()

      # This is an activation event, triggering it will cause the package to be
      # activated.
      atom.workspaceView.trigger 'html-helper:closeElement'

      waitsForPromise ->
        activationPromise

      runs ->
        # expect(atom.workspaceView.find('.html-helper')).toExist()
        atom.workspaceView.trigger 'html-helper:closeElement'
        # expect(atom.workspaceView.find('.html-helper')).not.toExist()
