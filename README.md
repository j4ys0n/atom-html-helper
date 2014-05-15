# HTML Helper package

Initial version. I missed this feature when switching from SublimeText, so I made it a package. This adds the ability to complete HTML tags by pressing "cmd-opt-." This package also has the ability to close tags within the line you are on if an open tag is detected but not a close tag.

Currently, this only evaluates the line that the cursor is on.

Next steps will include multi-line evaluation, better handling of specific elements.

Place this in your Atom packages directory: ~/.atom/packages/

Version 0.2.x switches to using regular expressions to identify open/closed HTML elements.

# Issues

This is still in development, so it might occasionally complete the tag wrong, or "fix" a tag on your line that doesn't need to be fixed. Please let me know of any issues you run into and I will fix them!
