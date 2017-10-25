/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Say thanks to another, giving point
 * @param {org.acme.mynetwork.Thanks} thanks - the thanks to be processed
 * @transaction
 */
function sayThanks(thanks) {
    if (thanks.givePointValue < 0) {
        throw new Error('givePointValue is negative');
    }
    if (thanks.sourcer.thanksPoint < thanks.givePointValue) {
        throw new Error('givePointValue exceeds sourcer\'s one');
    }
    if (thanks.sourcer.$identifier === thanks.destinator.$identifier) {
        throw new Error('saying thanks to myself is prohibited')
    }
    if (thanks.message.length < 20) {
        throw new Error('message is heartless')
    }
    thanks.sourcer.thanksPoint -= thanks.givePointValue;
    thanks.destinator.virtuePoint += thanks.givePointValue;
    return getParticipantRegistry('org.acme.mynetwork.Employee')
        .then(function (participantRegistry) {
            return participantRegistry.updateAll([thanks.sourcer, thanks.destinator]);
        });
}