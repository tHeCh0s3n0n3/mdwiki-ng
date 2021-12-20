import { library, dom, config } from '@fortawesome/fontawesome-svg-core';

config.autoAddCss = true;
config.keepOriginalSource = false;
config.autoReplaceSvg = true;
config.observeMutations = true;

import { faMoon, faSun, faAngleDown} from '@fortawesome/free-solid-svg-icons'

library.add(faMoon, faSun, faAngleDown);
dom.watch();