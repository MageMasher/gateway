/**
 * Settings Screen.
 *
 * UI for gateway settings.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/* globals App, API, Menu, page */

// eslint-disable-next-line no-unused-vars
var SettingsScreen = {

  /**
  * Initialise Settings Screen.
  */
  init: function() {
    this.menu = document.getElementById('settings-menu');
    this.domainSettings = document.getElementById('domain-settings');
    this.userSettings = document.getElementById('user-settings');
    this.adapterSettings = document.getElementById('adapter-settings');
    this.addonSettings = document.getElementById('addon-settings');
    this.addonMainSettings = document.getElementById('addon-main-settings');
    this.addonDiscoverySettings =
      document.getElementById('addon-discovery-settings');
    this.experimentSettings = document.getElementById('experiment-settings');
    this.updateSettings = document.getElementById('update-settings');
    this.backButton = document.getElementById('settings-back-button');
  },

  show: function(section, subsection) {
    this.backButton.href = '/settings';

    if (section) {
      this.showSection(section, subsection);
    } else {
      this.showMenu();
    }
  },

  showMenu: function() {
    App.showMenuButton();
    this.hideBackButton();
    this.menu.classList.remove('hidden');
    this.domainSettings.classList.add('hidden');
    this.userSettings.classList.add('hidden');
    this.adapterSettings.classList.add('hidden');
    this.addonSettings.classList.add('hidden');
    this.addonMainSettings.classList.add('hidden');
    this.addonDiscoverySettings.classList.add('hidden');
    this.experimentSettings.classList.add('hidden');
    this.updateSettings.classList.add('hidden');
  },

  hideMenu: function() {
    this.menu.classList.add('hidden');
  },

  showBackButton: function() {
    this.backButton.classList.remove('hidden');
  },

  hideBackButton: function() {
    this.backButton.classList.add('hidden');
  },

  showSection: function(section, subsection) {
    switch(section) {
      case 'domain':
        this.showDomainSettings();
        break;
      case 'users':
        this.showUserSettings();
        break;
      case 'adapters':
        this.showAdapterSettings();
        break;
      case 'addons':
        if (subsection) {
          switch(subsection) {
            case 'discover':
              this.showDiscoverAddonsScreen();
              break;
            default:
              console.error('Tried to display undefined subsection');
              return;
          }
        } else {
          this.showAddonSettings();
        }
        break;
      case 'experiments':
        this.showExperimentSettings();
        break;
      case 'updates':
        this.showUpdateSettings();
        break;
      default:
        console.error('Tried to display undefined section');
        return;
    }
    this.hideMenu();
    App.hideMenuButton();
    this.showBackButton();
  },

  showDomainSettings: function() {
    this.domainSettings.classList.remove('hidden');
    const opts = {
      headers: API.headers(),
    };
    fetch('/settings/tunnelinfo', opts).then(function (response) {
      return response.text();
    }).then(function (body) {
      if (body) {
        document.getElementById('current-domain').innerText = body;
      } else {
        document.getElementById('current-domain').innerText = 'Not set.';
      }
    });
  },

  showUserSettings: function() {
    this.userSettings.classList.remove('hidden');
    window.API.getUserInfo().then(function (response) {
     if (response.name) {
       document.getElementById('current-user-name').innerText = response.name;
     } else {
       document.getElementById('current-user-name').innerText = '';
     }
     if (response.email) {
       document.getElementById('current-user-email').innerText = response.email;
     } else {
       document.getElementById('current-user-email').innerText = '';
     }
    });
  },

  showAdapterSettings: function() {
    this.adapterSettings.classList.remove('hidden');

    const opts = {
      headers: API.headers(),
    };

    // Fetch a list of adapters from the server
    fetch('/adapters', opts).then(function (response) {
      return response.json();
    }).then(function (adapters) {
      const adaptersList = document.getElementById('adapters-list');
      adaptersList.innerHTML = '';

      for (const metadata of adapters) {
        const li = document.createElement('li');
        li.className = 'adapter-item';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'adapter-settings-header';

        const titleDiv = document.createElement('div');
        titleDiv.innerText = metadata.name;
        titleDiv.className = 'adapter-settings-name';

        const descriptionDiv = document.createElement('div');
        descriptionDiv.innerText = metadata.id;
        descriptionDiv.className = 'adapter-settings-description';

        const controlDiv = document.createElement('div');
        controlDiv.className = 'adapter-settings-controls';

        const toggleButton = document.createElement('button');
        toggleButton.id = `adapter-toggle-${metadata.id}`;
        toggleButton.className = 'text-button';
        toggleButton.adapterEnabled = metadata.ready;

        if (metadata.ready) {
          toggleButton.innerText = 'Disable';
          toggleButton.classList.add('adapter-settings-disable');
        } else {
          toggleButton.innerText = 'Enable';
          toggleButton.classList.add('adapter-settings-enable');
        }

        /* TODO
        toggleButton.addEventListener('click', function(e) {
          const value = !e.target.adapterEnabled;
          e.target.adapterEnabled = value;

          window.API.setAdapterSetting(metadata.id, value)
            .then(function() {
              if (value) {
                e.target.innerText = 'Disable';
                toggleButton.classList.remove('adapter-settings-enable');
                toggleButton.classList.add('adapter-settings-disable');
              } else {
                e.target.innerText = 'Enable';
                toggleButton.classList.remove('adapter-settings-disable');
                toggleButton.classList.add('adapter-settings-enable');
              }
            })
            .catch(function(e) {
              console.error(
                'Failed to toggle add-on', settings.name, ': ', e);
            });
        });
        */

        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(descriptionDiv);

        controlDiv.appendChild(toggleButton);

        li.appendChild(headerDiv);
        li.appendChild(controlDiv);
        adaptersList.appendChild(li);
      }
    });
  },

  showAddonSettings: function() {
    this.addonSettings.classList.remove('hidden');
    this.addonDiscoverySettings.classList.add('hidden');
    this.addonMainSettings.classList.remove('hidden');

    const discoverAddonsButton =
      document.getElementById('discover-addons-button');
    discoverAddonsButton.addEventListener('click', () => {
      page('/settings/addons/discover');
    });

    const opts = {
      headers: API.headers(),
    };
    fetch('/settings/addons', opts).then(function (response) {
      return response.json();
    }).then(function (body) {
      if (!body) {
        return;
      }

      const addonList = document.getElementById('available-addons-list');
      addonList.innerHTML = '';

      for (const s of body) {
        try {
          const settings = JSON.parse(s.value);

          const li = document.createElement('li');
          li.className = 'addon-item';

          const headerDiv = document.createElement('div');
          headerDiv.className = 'addon-settings-header';

          const titleDiv = document.createElement('div');
          titleDiv.innerText = settings.name;
          titleDiv.className = 'addon-settings-name';

          const descriptionDiv = document.createElement('div');
          descriptionDiv.innerText = settings.description;
          descriptionDiv.className = 'addon-settings-description';

          const controlDiv = document.createElement('div');
          controlDiv.className = 'addon-settings-controls';

          const toggleButton = document.createElement('button');
          toggleButton.id = `addon-toggle-${settings.name}`;
          toggleButton.className = 'text-button';
          toggleButton.addonEnabled = settings.moziot.enabled;

          if (settings.moziot.enabled) {
            toggleButton.innerText = 'Disable';
            toggleButton.classList.add('addon-settings-disable');
          } else {
            toggleButton.innerText = 'Enable';
            toggleButton.classList.add('addon-settings-enable');
          }

          toggleButton.addEventListener('click', function(e) {
            const value = !e.target.addonEnabled;
            e.target.addonEnabled = value;

            window.API.setAddonSetting(settings.name, value)
              .then(function() {
                if (value) {
                  e.target.innerText = 'Disable';
                  toggleButton.classList.remove('addon-settings-enable');
                  toggleButton.classList.add('addon-settings-disable');
                } else {
                  e.target.innerText = 'Enable';
                  toggleButton.classList.remove('addon-settings-disable');
                  toggleButton.classList.add('addon-settings-enable');
                }
              })
              .catch(function(e) {
                console.error(
                  'Failed to toggle add-on', settings.name, ': ', e);
              });
          });

          headerDiv.appendChild(titleDiv);
          headerDiv.appendChild(descriptionDiv);

          controlDiv.appendChild(toggleButton);

          li.appendChild(headerDiv);
          li.appendChild(controlDiv);
          addonList.appendChild(li);
        } catch (err) {
          console.log('Failed to parse add-on settings:', s);
        }
      }
    });
  },

  showDiscoverAddonsScreen: function() {
    this.backButton.href = '/settings/addons';
    this.addonSettings.classList.remove('hidden');
    this.addonMainSettings.classList.add('hidden');
    this.addonDiscoverySettings.classList.remove('hidden');

    const opts = {
      headers: API.headers(),
    };
    fetch('/addons/discover', opts).then(function (response) {
      return response.json();
    }).then(function (body) {
      if (!body) {
        return;
      }

      const addonList = document.getElementById('discovered-addons-list');
      addonList.innerHTML = '';

      for (const addon of body) {
        const li = document.createElement('li');
        li.className = 'addon-item';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'addon-settings-header';

        const titleDiv = document.createElement('div');
        titleDiv.innerText = addon.display_name;
        titleDiv.className = 'addon-settings-name';

        const descriptionDiv = document.createElement('div');
        descriptionDiv.innerText = addon.description;
        descriptionDiv.className = 'addon-settings-description';

        const controlDiv = document.createElement('div');
        controlDiv.className = 'addon-settings-controls';

        let actionElement;

        if (addon.installed) {
          actionElement = document.createElement('div');
          actionElement.className = 'addon-discovery-settings-added';
          actionElement.innerText = 'Added';
        } else {
          actionElement = document.createElement('button');
          actionElement.id = `addon-install-${addon.name}`;
          actionElement.className = 'text-button addon-discovery-settings-add';
          actionElement.innerText = 'Add';
        }

        /* TODO
        installButton.addEventListener('click', function(e) {
          const value = !e.target.addonEnabled;
          e.target.addonEnabled = value;

          window.API.installAddon(addon.name, value)
            .then(function() {
              if (value) {
                controlDiv.innerHTML = '';
                const el = document.createElement('div');
                el.className = 'addon-discovery-settings-added';
                controlDiv.appendChild(el);
              }
            })
            .catch(function(e) {
              console.error(
                'Failed to install add-on', addon.name, ': ', e);
            });
        });
        */

        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(descriptionDiv);

        controlDiv.appendChild(actionElement);

        li.appendChild(headerDiv);
        li.appendChild(controlDiv);
        addonList.appendChild(li);
      }
    });
  },

  showExperimentCheckbox: function(experiment, checkboxId) {
    var checkbox = document.getElementById(checkboxId);
    window.API.getExperimentSetting(experiment)
    .then(function(value) {
      checkbox.checked = value;
    })
    .catch(function(e) {
      console.error('Error getting ' + experiment + ' experiment setting ' + e);
    });

    checkbox.addEventListener('change', function(e) {
      var value = e.target.checked ? true : false;
      window.API.setExperimentSetting(experiment, value).then(function() {
        if (value) {
          Menu.showItem(experiment);
        } else {
          Menu.hideItem(experiment);
        }
      }).catch(function(e) {
        console.error('Failed to enable ' + experiment + ' experiment: ' + e);
      });
    });
  },

  showExperimentSettings: function() {
    this.experimentSettings.classList.remove('hidden');
    this.showExperimentCheckbox('floorplan', 'floorplan-experiment-checkbox');
    this.showExperimentCheckbox('speech', 'speech-experiment-checkbox');
    this.showExperimentCheckbox('rules', 'rules-experiment-checkbox');
  },

  /**
   * Compare two semantic versions
   * @param {String} verA
   * @param {String} verB
   * @return {number} 0 if verA == verB, -1 if verA < verB, 1 if verA > verB
   */
  compareSemver: function(verA, verB) {
    if (verA === verB) {
      return 0;
    }

    function parsePart(part) {
      return parseInt(part);
    }

    let partsA = verA.split('.').map(parsePart);
    let partsB = verB.split('.').map(parsePart);

    for (var i = 0; i < partsA.length; i++) {
      let partA = partsA[i];
      let partB = partsB[i];
      if (partA === partB) {
        continue;
      }
      if (partA < partB) {
        return -1;
      }
      return 1;
    }
    return 0;
  },

  showUpdateSettings: function() {
    this.updateSettings.classList.remove('hidden');
    let updateNow = document.getElementById('update-now');

    updateNow.addEventListener('click', this.onUpdateClick);
    this.fetchUpdateInfo();
  },

  fetchUpdateInfo: function() {
    let upToDateElt = document.getElementById('update-settings-up-to-date');
    let updateNow = document.getElementById('update-now');
    let versionElt = document.getElementById('update-settings-version');
    let statusElt = document.getElementById('update-settings-status');

    let fetches = Promise.all([API.getUpdateStatus(), API.getUpdateLatest()]);
    fetches.then(function(results) {
      let status = results[0];
      let latest = results[1];
      let cmp = 0;
      if (latest.version) {
        cmp = this.compareSemver(status.version, latest.version);
      }
      if (cmp < 0) {
        // Update available
        upToDateElt.textContent = 'New version available';
        updateNow.classList.remove('hidden');
        updateNow.classList.remove('disabled');
      } else {
        // All up to date!
        upToDateElt.textContent = 'Your system is up to date';
        updateNow.classList.add('hidden');
      }
      versionElt.textContent = `Current version: ${status.version}`;
      let statusText = 'Last update: ';

      if (status.timestamp) {
        statusText += new Date(status.timestamp).toString();

        if (!status.success) {
          statusText += ' (failed)';
        }
      } else {
        statusText += 'Never';
      }

      statusElt.textContent = statusText;
    }.bind(this));

  },

  onUpdateClick: function() {
    let updateNow = document.getElementById('update-now');
    updateNow.removeEventListener('click', this.onUpdateClick);
    updateNow.classList.add('disabled');

    fetch('/updates/update', {
      headers: API.headers(),
      method: 'POST'
    }).then(function() {
      updateNow.textContent = 'In Progress'
      let isDown = false;
      function checkStatus() {
        API.getUpdateStatus().then(function() {
          if (isDown) {
            SettingsScreen.showUpdateSettings();
            updateNow.textContent = 'Update Now';
          } else {
            setTimeout(checkStatus, 5000);
          }
        }).catch(function() {
          if (!isDown) {
            updateNow.textContent = 'Restarting';
            isDown = true;
          }
          setTimeout(checkStatus, 5000);
        });
      }
      checkStatus();
    }).catch(function() {
      updateNow.textContent = 'Error';
    });
  }
};
