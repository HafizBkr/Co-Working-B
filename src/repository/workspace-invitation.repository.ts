import WorkspaceInvitation, {
  IWorkspaceInvitation,
} from "../models/WorkspaceInvitation";
import { BaseRepository } from "./base.repository";

class WorkspaceInvitationRepositoryClass extends BaseRepository<IWorkspaceInvitation> {
  constructor() {
    super(WorkspaceInvitation);
  }

  async findByToken(token: string) {
    return this.findOne({ token });
  }

  async findPendingByEmailAndWorkspace(workspace: string, email: string) {
    return this.findOne({
      workspace,
      email: email.toLowerCase().trim(),
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
  }

  async createInvitation(data: Partial<IWorkspaceInvitation>) {
    return WorkspaceInvitation.create(data);
  }

  async setStatus(token: string, status: string) {
    return WorkspaceInvitation.findOneAndUpdate(
      { token },
      { status },
      { new: true },
    );
  }
}

export const WorkspaceInvitationRepository =
  new WorkspaceInvitationRepositoryClass();
export default WorkspaceInvitationRepository;
