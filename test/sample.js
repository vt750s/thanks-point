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

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BrowserFS = require('browserfs/dist/node/index');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const path = require('path');

require('chai').should();

const bfs_fs = BrowserFS.BFSRequire('fs');
const NS = 'org.acme.mynetwork';

describe('Saying Thanks', () => {

    // let adminConnection;
    let businessNetworkConnection;

    before(() => {
        BrowserFS.initialize(new BrowserFS.FileSystem.InMemory());
        const adminConnection = new AdminConnection({ fs: bfs_fs });
        return adminConnection.createProfile('defaultProfile', {
            type: 'embedded'
        })
            .then(() => {
                return adminConnection.connect('defaultProfile', 'admin', 'adminpw');
            })
            .then(() => {
                return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
            })
            .then((businessNetworkDefinition) => {
                return adminConnection.deploy(businessNetworkDefinition);
            })
            .then(() => {
                businessNetworkConnection = new BusinessNetworkConnection({ fs: bfs_fs });
                return businessNetworkConnection.connect('defaultProfile', 'thanks-point', 'admin', 'adminpw');
            });
    });

    describe('#sayThanks', () => {

        it('should be able to say thanks', () => {
            const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            // create the company
            const nec = factory.newResource(NS, 'Company', '6701');
            nec.name = 'NEC';
            const fj = factory.newResource(NS, 'Company', '6702');
            fj.name = 'Fujitsu';

            // create the employee
            const tom = factory.newResource(NS, 'Employee', '6701-000000');
            tom.name = 'Tom';
            tom.thanksPoint = 100;
            tom.virtuePoint = 0;
            tom.employer = factory.newRelationship(NS, 'Company', nec.$identifier);
            const john = factory.newResource(NS, 'Employee', '6702-000000');
            john.name = 'John';
            john.thanksPoint = 100;
            john.virtuePoint = 0;
            john.employer = factory.newRelationship(NS, 'Company', fj.$identifier);

            // create the thanks transaction
            const thanks = factory.newTransaction(NS, 'Thanks');
            thanks.sourcer = factory.newRelationship(NS, 'Employee', tom.$identifier);
            thanks.destinator = factory.newRelationship(NS, 'Employee', john.$identifier);
            thanks.givePointValue = 10;
            thanks.message = 'Thank you for your nice idea.';

            // thw employer of each employee should be right
            tom.employer.$identifier.should.equal(nec.$identifier);
            john.employer.$identifier.should.equal(fj.$identifier);

            // Get the asset registry.
            let employeeRegistry;
            return businessNetworkConnection.getParticipantRegistry(NS + '.Employee')
                .then((empRegistry) => {
                    employeeRegistry = empRegistry;
                    // add the commodity to the asset registry.
                    return empRegistry.addAll([tom, john]);
                })
                .then(() => {
                    return businessNetworkConnection.getParticipantRegistry(NS + '.Company');
                })
                .then((participantRegistry) => {
                    // add the traders
                    return participantRegistry.addAll([nec, fj]);
                })
                .then(() => {
                    // submit the transaction
                    return businessNetworkConnection.submitTransaction(thanks);
                })
                .then(() => {
                    // re-get the Tom
                    return employeeRegistry.get(tom.$identifier);
                })
                .then((newTom) => {
                    // the thanksPoint of Tom should be 90 (100 - 10)
                    newTom.thanksPoint.should.equal(90);
                    // the virtuePoint of Tom shoud be 0 (not changed)
                    newTom.virtuePoint.should.equal(0);
                    // re-get the John
                    return employeeRegistry.get(john.$identifier);
                })
                .then((newJohn) => {
                    // the thanksPoint of John should be 100 (not changed)
                    newJohn.thanksPoint.should.equal(100);
                    // the virtuePoint of John shoud be 10 (0 + 10)
                    newJohn.virtuePoint.should.equal(10);
                });
        });
    });
});