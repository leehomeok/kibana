/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import 'ui/autoload/styles';
import 'ui/i18n';
import chrome from 'ui/chrome';
import { npStart } from 'ui/new_platform';
import { destroyStatusPage, renderStatusPage } from './components/render';

npStart.core.chrome.navLinks.enableForcedAppSwitcherNavigation();

chrome
  .setRootTemplate(require('plugins/status_page/status_page.html'))
  .setRootController('ui', function ($scope, buildNum, buildSha) {
    $scope.$$postDigest(() => {
      renderStatusPage(buildNum, buildSha.substr(0, 8));
      $scope.$on('$destroy', destroyStatusPage);
    });
  });
