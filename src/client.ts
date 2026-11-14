import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

// Load protobuf definition
const packageDefinition = protoLoader.loadSync("./proto/user.proto", {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

// Load gRPC package
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

const userPackage = grpcObject.user as any;

// Create client
const client = new userPackage.UserService(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

// GetUser RPC
const getUser = (id: string) => {
    client.GetUser(
        { id },
        (error: grpc.ServiceError | null, response: any) => {
            if (error) {
                console.error("GetUser error:", error);
                client.close();
                return;
            }

            console.log("\nFetched user:");
            console.log(response);

            client.close();
        }
    );
};

// CreateUser RPC
const createUser = () => {
    client.CreateUser(
        {
            name: "Ashish",
            email: "ashish@example.com",
        },
        (error: grpc.ServiceError | null, response: any) => {
            if (error) {
                console.error("CreateUser error:", error);
                client.close();
                return;
            }

            console.log("\nCreated user:");
            console.log(response);

            // Fetch the newly created user
            getUser(response.id);
        }
    );
};

// Start client/
getUser("bf9a3dd0-3233-4acd-ad1b-cf69c942e235")