import { Identity, ReversibleSet } from '@hyper-hyper-space/core';
import { Message } from './Message';
import { UserSet } from './UserSet';


class MessageSet extends ReversibleSet<Message> {

    users?: UserSet;

    constructor(users?: UserSet) {
        super();

        if (users !== undefined) {
            this.users = users;
            this.setAuthor(users.getAuthor() as Identity);
        }
    }

}

export { MessageSet }