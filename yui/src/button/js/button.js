// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_storage
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module     moodle-atto_storage-button
 */

/**
 * Atto text editor storage plugin.
 *
 * @namespace M.atto_storage
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var warningMessage = '' +
    '<div class="storage-warning">' +
        '<div>' +
            '<div class="message">' +
            '{{get_string "warningmessage" component}}' +
            '</div>' +
            '<div class="preview">{{{content}}}</div>' +
            '<div class="buttons">' +
                '<button class="discard btn btn-warning">Discard</button>' +
                '<button class="restore btn btn-primary">Restore</button>' +
            '</div>' +
        '</div>' +
    '</div>';

Y.namespace('M.atto_storage').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * The storage space for the plugin.
     *
     * @property _storageSpace
     * @type CacheOffline
     * @default null
     */
    _storageSpace: null,

    /**
     */
    _elementid: null,

    initializer: function() {
        var host = this.get('host');

        this._elementid = host.get('elementid');

        // Try and get the form.
        var form = this.get('host').editor.ancestor('form'),
            sandbox = this._elementid;

        if (form) {
            var formid = form.getAttribute('id');
            if (formid) {
                sandbox = formid;
            }
        }

        this._storageSpace = new Y.CacheOffline({
            sandbox: sandbox
        });

        // Update the cache on change.
        host.on('change', this._updateCache, this);

        // Clear the cache on submission.
        this.editor.ancestor('form').on('submit', this._clearCache, this);

        this._updateFromCache();
    },

    _updateFromCache: function() {
        // Check whether there's an existing cache object.
        var currentCache = this._storageSpace.retrieve(this._elementid),
            host = this.get('host');

        if (currentCache && currentCache.response && currentCache.response !== host.textarea.get('value')) {
            // Check that the user wants to update their content.
            var template = Y.Handlebars.compile(warningMessage),
                content = Y.Node.create(template({
                        component: 'atto_storage',
                        content: currentCache.response
                    })),
                height = this.editor.getComputedStyle('height'),
                width = this.editor.getComputedStyle('width');

            var overlay = new Y.Overlay({
                bodyContent: content,
                visible: true,
                render: true,
                //xy: this.editor.getXY(),
                height: height,
                width: width
            });
            overlay.align(this.editor, [Y.WidgetPositionAlign.CC, Y.WidgetPositionAlign.CC]);
            content.one('.restore').on('click', function() {
                host.textarea.set('value', currentCache.response);
                host.updateFromTextArea();
                overlay.hide()
                        .destroy();
            }, this);
            content.one('.discard').on('click', function() {
                overlay.hide()
                        .destroy();
                this._clearCache();
            }, this);

            content.one('.preview').setStyle('maxHeight', parseInt(height, 10) - 90 + 'px');
        }
    },

    /**
     * Update the cache based on the value of the text area.
     *
     * @method _updateCache
     * @private
     */
    _updateCache: function(e) {
        console.log(e);
        this._storageSpace.add(this._elementid, this.get('host').textarea.get('value'));
    },

    /**
     * Clear the cache.
     *
     * @method _clearCache
     * @private
     */
    _clearCache: function() {
        this._storageSpace.add(this._elementid, null);
    }
});
