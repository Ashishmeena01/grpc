import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { error } from "node:console";
import crypto from "node:crypto";

const PROTO_PATH = "./proto/user.proto";

// Load protobuf definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

// Load gRPC package
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

const userPackage = grpcObject.user as any;

// User model
interface User {
    id: string;
    name: string;
    email: string;
}

// In-memory database
const users = new Map<string, User>();

// CreateUser RPC handler
const createUser = (
    call: grpc.ServerUnaryCall<any, User>,
    callback: grpc.sendUnaryData<User>
) => {
    const { name, email } = call.request;

    const user: User = {
        id: crypto.randomUUID(),
        name,
        email,
    };

    users.set(user.id, user);

    console.log("Created user:", user);

    callback(null, user);
};

// GetUser RPC handler
const getUser = (
    call: grpc.ServerUnaryCall<any, User>,
    callback: grpc.sendUnaryData<User>
) => {
    const { id } = call.request;

    const user = users.get(id);

    if (!user) {
        return callback({
            code: grpc.status.NOT_FOUND,
            message: "User not found",
        },{id:"1",name:"ashish",email:"a@a.com"});
    }

    callback(null, user);
};

// Create gRPC server
const server = new grpc.Server();

// Register service methods
server.addService(userPackage.UserService.service, {
    CreateUser: createUser,
    GetUser: getUser,
});

// Start server
server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error("Server error:", error);
            return;
        }

        console.log(`gRPC server running on port ${port}`);
    }
);
