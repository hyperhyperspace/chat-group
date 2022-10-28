import { Authorizer, Authorization, CausalSet, Hash, HashedObject, Identity, ClassRegistry } from '@hyper-hyper-space/core';

import { Feature } from './ChatConfig';

class MemberSet extends CausalSet<Identity> {

    static className = 'chat-group/v0/model/MemberSet';

    moderators?      : CausalSet<Identity>;
    enabledFeatures? : CausalSet<Feature>;
    
    constructor(moderators?: CausalSet<Identity>, enabledFeatures?: CausalSet<Feature>) {
        super({acceptedTypes: [Identity.className], mutableWriters: moderators});

        if (moderators !== undefined) {
            this.moderators = moderators;

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
        
        if (this.moderators === undefined || !(this.moderators instanceof CausalSet)) {
            return false;
        }

        if (this.enabledFeatures === undefined || !(this.enabledFeatures instanceof CausalSet)) {
            return false;
        }

        return true;

    }

    getModerators() {
        return this.moderators as CausalSet<Identity>;
    }

    getEnabledFeatures() {
        return this.enabledFeatures as CausalSet<Feature>;
    }

    createAddAuthorizer(who: Identity, author: Identity): Authorizer {


        const moderatorAdd  = this.getModerators().createMembershipAuthorizer(author);

        const memberAdd = Authorization.all([
                this.getEnabledFeatures().createMembershipAuthorizer(Feature.MemberInvites),
                this.createMembershipAuthorizer(author)]);


        const alternatives = [moderatorAdd, memberAdd];

        if (who.equals(author)) {
            const selfAdd = this.getEnabledFeatures().createMembershipAuthorizer(Feature.OpenNewMembers);
            alternatives.push(selfAdd);
        }        
    
        return Authorization.chain(
                    super.createAddAuthorizer(who, author), 
                    Authorization.oneOf(alternatives));

    }

    createDeleteAuthorizerByHash(who: Hash, author: Identity) {

        const moderatorDelete = this.getModerators().createMembershipAuthorizer(author);

        const alternatives = [moderatorDelete];

        // allow a member to delete themselves
        if (who === author.hash()) {
            alternatives.unshift(Authorization.always);
        }

        return Authorization.chain(
                    super.createDeleteAuthorizerByHash(who, author),
                    Authorization.oneOf(alternatives));
    }
}

ClassRegistry.register(MemberSet.className, MemberSet);

export { MemberSet };