import { Authorizer, Authorization, CausalSet, Hash, HashedObject, Identity } from '@hyper-hyper-space/core';

import { Feature } from './ChatConfig';

// an admin managed set with an exception: members may remove themselves

class MemberSet extends CausalSet<Identity> {

    static className = 'chat-group/v0/model/MemberSet';

    admins?          : CausalSet<Identity>;
    enabledFeatures? : CausalSet<Feature>;
    
    constructor(admins?: CausalSet<Identity>, enabledFeatures?: CausalSet<Feature>) {
        super([Identity.className]);

        if (admins !== undefined) {
            this.admins = admins;

            if (enabledFeatures === undefined) {
                throw new Error('A MemberSet cannot be constructed without an enabledFeatures parameter');
            }

            this.enabledFeatures = enabledFeatures;
        }
    }

    getClassName(): string {
        return MemberSet.className;
    }

    async add(who: Identity, author: Identity): Promise<boolean> {
        return super.add(who, author);
    }

    async delete(who: Identity, author: Identity): Promise<boolean> {
        return this.deleteByHash(who.hash(), author);
    }

    async deleteByHash(who: Hash, author: Identity): Promise<boolean> {
        return super.deleteByHash(who, author);
    }

    async validate(references: Map<string, HashedObject>): Promise<boolean> {

        references;

        if (!await super.validate(references)) {
            return false;
        }

        if (!this.getAuthor() === undefined) {
            return false;
        }

        if (!this.checkAcceptedTypes([Identity.className])) {
            return false;
        }

        if (!this.checkAcceptedElementsIsMissing()) {
            return false;
        }
        
        if (this.admins === undefined || !(this.admins instanceof CausalSet)) {
            return false;
        }

        if (this.enabledFeatures === undefined || !(this.enabledFeatures instanceof CausalSet)) {
            return false;
        }

        return true;

    }

    getAdmins() {
        return this.admins as CausalSet<Identity>;
    }

    getEnabledFeatures() {
        return this.enabledFeatures as CausalSet<Feature>;
    }

    createAddAuthorizer(who: Identity, author: Identity): Authorizer {


        const adminAdd  = this.getAdmins().createMembershipAuthorizer(author);

        const memberAdd = Authorization.all([
                this.getEnabledFeatures().createMembershipAuthorizer(Feature.MemberInvites),
                this.createMembershipAuthorizer(author)]);


        const alternatives = [adminAdd, memberAdd];

        if (who.equals(author)) {
            const selfAdd = this.getEnabledFeatures().createMembershipAuthorizer(Feature.OpenNewMembers);
            alternatives.push(selfAdd);
        }        
    
        return Authorization.chain(
                    super.createAddAuthorizer(who, author), 
                    Authorization.oneOf(alternatives));

    }

    createDeleteAuthorizerByHash(who: Hash, author: Identity) {

        const adminDelete = this.getAdmins().createMembershipAuthorizer(author);

        const alternatives = [adminDelete];

        // allow a member to delete themselves
        if (who === author.hash()) {
            alternatives.unshift(Authorization.always);
        }

        return Authorization.chain(
                    super.createDeleteAuthorizerByHash(who, author),
                    Authorization.oneOf(alternatives));
    }
}

HashedObject.registerClass(MemberSet.className, MemberSet);

export { MemberSet };