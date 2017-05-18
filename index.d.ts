export as namespace odatajs;

export var version: {
    major: number;
    minor: number;
    build: number;
};

import * as deferred from './lib/deferred';
import * as utils from './lib/utils';
import * as xml from './lib/xml';
import * as oData from './lib/odata';
import * as store from './lib/store';
import * as cache from './lib/cache';

export { deferred, utils, xml, oData, store, cache };

export { Batch, Edm, Edmx, EdmExtra } from './lib/interfaces';