import { UserRepository } from "../repository/UserRepository";

class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser(userData: {
    email: string;
    password: string;
    username: string;
    avatar?: string;
    bio?: string;
    location?: string;
  }) {
    const user = await this.userRepository.register(userData);

    if (!user) {
      throw new Error("User with this email already exists");
    }

    return {
      userId: user._id,
      email: user.email,
      username: user.username,
    };
  }
  async loginUser(email: string, password: string) {
    const user = await this.userRepository.login(email, password);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    return {
      userId: user._id,
      email: user.email,
      username: user.username,
    };
  }
}
