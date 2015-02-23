/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
(function($) {
  $.fn.prettify = function(options) {
    return this.each(function() {
      try {
        var $code = $(document.createElement('div')).addClass('code');
        $(this).before($code).remove();
        var content = $(this).text();
        var match = /(xml|json)/.exec($(this).attr('data-type'));
        var format = (match) ? match[1] : null;
        var html = null;
        if (format == 'xml') {
          var xmlDoc = $.parseXML(content);
          html = (xmlDoc) ? formatXML(xmlDoc) : null;
        } else if (format == 'json') {
          var jsonObj = $.parseJSON(content);
          html = (jsonObj) ? formatJSON(jsonObj) : null;
        }
        if (html) {
          $code.addClass(format).html(html).find('.list').each(function() {
            if (this.parentNode.nodeName == 'LI') {
              $(document.createElement('div')).addClass("toggle").text("-").click(function() {
                var target = $(this).siblings('.list:first');
                if (target.size() != 1)
                  return;
                if (target.is(':hidden')) {
                  target.show().siblings('.deffered').remove();
                } else {
                  target.hide().before($(document.createElement('span')).attr("class", "deffered").html("..."));
                }
                $(this).text($(this).text() == '-' ? '+' : '-');
              }).insertBefore($(this.parentNode).children(':first'));
            }
          });
        }
      } catch (e) {
        console.log(e);
      }
      /* encode html */
      function encodeHtml(html) {
        return (html != null) ? html.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
      }
      /* convert json to html */
      function formatJSON(value) {
        var typeofValue = typeof value;
        if (value == null) {
          return '<span class="null">null</span>';
        } else if (typeofValue == 'number') {
          return '<span class="numeric">' + encodeHtml(value) + '</span>';
        } else if (typeofValue == 'string') {
          if (/^(http|https):\/\/[^\s]+$/.test(value)) {
            var fragment = '';
            var fragmentIndex = value.indexOf('#');
            if (fragmentIndex != -1) {
              fragment = value.substr(fragmentIndex);
              value = value.substr(0, fragmentIndex);
            }
            var format = (value.length > 7) ? (value.substr(value.length - 7, 7) == '/$value' ? '' : '&$format=json' ) : '';
            format = (value.length > 10) ? (value.substr(value.length - 10, 10) == '/$metadata' ? '' : '&$format=json' ) : '';
            var separator = (value.indexOf('?') == -1) ? '?' : '&';
            return '<span class="string">"<a href="' + value + format + fragment + '">' + encodeHtml(value) + encodeHtml(fragment) + '</a>"</span>';
          } else {
            return '<span class="string">"' + encodeHtml(value) + '"</span>'
          }
        } else if (typeofValue == 'boolean') {
          return '<span class="boolean">' + encodeHtml(value) + '</span>'
        } else if (value && value.constructor == Array) {
          return formatArray(value);
        } else if (typeofValue == 'object') {
          return formatObject(value);
        } else {
          return '';
        }
        function formatArray(json) {
          var html = '';
          for ( var prop in json)
            html += '<li>' + formatJSON(json[prop]) + '</li>';
          return (html) ? '<span class="array">[</span><ul class="array list">' + html + '</ul><span class="array">]</span>' : '<span class="array">[]</span>'
        }
        function formatObject(json) {
          var html = '';
          for ( var prop in json)
            html += '<li><span class="property">' + encodeHtml(prop) + '</span>: ' + formatJSON(json[prop]) + '</li>';
          return (html) ? '<span class="obj">{</span><ul class="obj list">' + html + '</ul><span class="obj">}</span>' : '<span class="obj">{}</span>';
        }
      }
      /* convert xml to html */
      function formatXML(document) {
        return formatElement(document.documentElement);
        function formatElement(element) {
          var html = '<span>&lt;</span><span class="tag">' + encodeHtml(element.nodeName) + '</span>';
          if (element.attributes && element.attributes.length > 0) {
           html += formatAttributes(element);
          }
          if (element.childNodes && element.childNodes.length > 0) {
            html += '<span>&gt;</span>';
            if (element.childNodes.length == 1 && element.childNodes[0].nodeType == 3) {
              html += '<span class="text">' + encodeHtml(element.childNodes[0].nodeValue) + '</span>';
            } else {
              html += formatChildNodes(element.childNodes);                    
            } 
            html += '<span>&lt;/</span><span class="tag">' + encodeHtml(element.nodeName) + '</span><span>&gt;</span>';
          } else {
            html += '<span>/&gt;</span>';
          } 
          return html;                
        }
        function formatChildNodes(childNodes) {
          html = '<ul class="list">';
          for ( var i = 0; i < childNodes.length; i++) {
            var node = childNodes[i];
            if (node.nodeType == 1) {
              html += '<li>' + formatElement(node) + '</li>';
            } else if (node.nodeType == 3 && !/^\s+$/.test(node.nodeValue)) {
              html += '<li><span class="text">' + encodeHtml(node.nodeValue) + '</span></li>';
            } else if (node.nodeType == 4) {
              html += '<li><span class="cdata">&lt;![CDATA[' + encodeHtml(node.nodeValue) + ']]&gt;</span></li>';
            } else if (node.nodeType == 8) {
              html += '<li><span class="comment">&lt;!--' + encodeHtml(node.nodeValue) + '--&gt;</span></li>';
            }
          }
          html += '</ul>';
          return html;
        }
        function formatAttributes(element) {
          var html = '';
          for (var i = 0; i < element.attributes.length; i++) {
            var attribute = element.attributes[i];
            if (/^xmlns:[^\s]+$/.test(attribute.nodeName)) {
              html += ' <span class="ns">' + encodeHtml(attribute.nodeName) + '="' + encodeHtml(attribute.nodeValue) + '"</span>';
            } else {
              html += ' <span class="atn">' + encodeHtml(attribute.nodeName) + '</span>=';
              if (attribute.nodeName == 'href' || attribute.nodeName == 'src') {
                var separator = (attribute.nodeValue.indexOf('?') == -1) ? '?' : '&';
                var href = (element.baseURI && attribute.nodeValue[0] != '/') ? element.baseURI + attribute.nodeValue : attribute.nodeValue;
                html += '"<a class="link" href="' + href + '">' + encodeHtml(attribute.nodeValue) + '</a>"';                    
              } else {
                html += '"<span class="atv">' + encodeHtml(attribute.nodeValue) + '</span>"';
              }                
            }   
          }
          return html;
        }
      }
    });
  };
})(jQuery);