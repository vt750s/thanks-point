#
# Licensed under the Apache License, Version 2   (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2  
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
Feature: Sample
    Background:
        Given I have deployed the business network definition ..
        And I have added the following participants of type org.acme.mynetwork.Company
            | id   | name      |
            | 6701 | NEC       |
            | 6702 | Fujitsu   |
        And I have added the following participants of type org.acme.mynetwork.Employee
            | id          | name   | thanksPoint | virtuePoint | employer |
            | 6701-000000 | Tom    | 100         | 0           | 6701     |
            | 6701-000001 | John   | 100         | 0           | 6701     |
            | 6702-000000 | Ken    | 100         | 0           | 6702     |
        And I have issued the participant org.acme.mynetwork.Company#6701 with the identity nec
        And I have issued the participant org.acme.mynetwork.Company#6701 with the identity fj
        And I have issued the participant org.acme.mynetwork.Employee#6701-000000 with the identity tom
        And I have issued the participant org.acme.mynetwork.Employee#6701-000001 with the identity john
        And I have issued the participant org.acme.mynetwork.Employee#6702-000000 with the identity ken
    Scenario: NEC can read only his participants
        When I use the identity nec
        Then I should have the following participants of type org.acme.mynetwork.Employee
            | id          | name   | thanksPoint | virtuePoint | employer |
            | 6701-000000 | Tom    | 100         | 0           | 6701     |
            | 6701-000001 | John   | 100         | 0           | 6701     |
        And I should not have the following participants of type org.acme.mynetwork.Employee
            | id          | name   | thanksPoint | virtuePoint | employer |
            | 6702-000000 | Ken    | 100         | 0           | 6702     |
    Scenario: NEC can add participants that it owns
        When I use the identity nec
        And I add the following participant of type org.acme.mynetwork.Employee
            | id          | name   | thanksPoint | virtuePoint | employer |
            | 6701-000002 | Chris  | 100         | 0           | 6701     |
        Then I should have the following participants of type org.acme.mynetwork.Employee
            | id          | name   | thanksPoint | virtuePoint | employer |
            | 6701-000000 | Tom    | 100         | 0           | 6701     |
            | 6701-000001 | John   | 100         | 0           | 6701     |
            | 6701-000002 | Chris  | 100         | 0           | 6701     |
    Scenario: NEC can not add participants to Fujitsu
        When I use the identity nec
        And I add the following participant of type org.acme.mynetwork.Employee
            | id          | name   | thanksPoint | virtuePoint | employer |
            | 6701-000002 | Chris  | 100         | 0           | 6702     |
        And I should get an error
    Scenario: Tom can say thanks to John
        When I use the identity tom
        And I submit the following transaction of type org.acme.mynetwork.Thanks
            | sourcer     | destinator  | givePointValue | message                       |
            | 6701-000000 | 6701-000001 | 10             | Thank you for your nice idea. |
        Then I should have the following participant of type org.acme.mynetwork.Employee
            | id          | name   | thanksPoint | virtuePoint | employer |
            | 6701-000000 | Tom    | 90          | 0           | 6701     |
    Scenario: Tom can not say thanks to Tom
        When I use the identity tom
        And I submit the following transaction of type org.acme.mynetwork.Thanks
            | sourcer     | destinator  | givePointValue | message                       |
            | 6701-000000 | 6701-000000 | 10             | Thank you for your nice idea. |
        Then I should get an error matching /prohibited/
    Scenario: Tom can not say special thanks to Jhon
        When I use the identity tom
        And I submit the following transaction of type org.acme.mynetwork.Thanks
            | sourcer     | destinator  | givePointValue | message                       |
            | 6701-000000 | 6701-000001 | 150            | Thank you for your nice idea. |
        Then I should get an error matching /exceed/
    Scenario: Tom can not say heartless thanks to Jhon
        When I use the identity tom
        And I submit the following transaction of type org.acme.mynetwork.Thanks
            | sourcer     | destinator  | givePointValue | message    |
            | 6701-000000 | 6701-000001 | 10             | Thank you. |
        Then I should get an error matching /heartless/
    Scenario: Tom can not say negative thanks to Jhon
        When I use the identity tom
        And I submit the following transaction of type org.acme.mynetwork.Thanks
            | sourcer     | destinator  | givePointValue | message    |
            | 6701-000000 | 6701-000001 | -10            | Thank you for your nice idea. |
        Then I should get an error matching /negative/
    Scenario: John can not say thanks to Jhon as Tom
        When I use the identity john
        And I submit the following transaction of type org.acme.mynetwork.Thanks
            | sourcer     | destinator  | givePointValue | message                       |
            | 6701-000000 | 6701-000001 | 10             | Thank you for your nice idea. |
        Then I should get an error
    Scenario: NEC can not say thanks to Jhon as Tom
        When I use the identity nec
        And I submit the following transaction of type org.acme.mynetwork.Thanks
            | sourcer     | destinator  | givePointValue | message                       |
            | 6701-000000 | 6701-000001 | 10             | Thank you for your nice idea. |
        Then I should get an error
    Scenario: Tom can not convert point from thansk to virtue without transaction
        When I use the identity tom
        And I update the following participants of type org.acme.mynetwork.Employee
            | id          | name   | thanksPoint | virtuePoint | employer |
            | 6701-000000 | Tom    | 0           | 100         | 6701     |
        Then I should get an error
