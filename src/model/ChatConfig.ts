
enum Feature {
    OpenReadAccess = 'open-read-access',
    OpenNewMembers = 'open-new-members',
    MemberInvites  = 'member-invites'
}

const AllFeatures = [Feature.OpenReadAccess, Feature.OpenNewMembers, Feature.MemberInvites];

export { Feature, AllFeatures };