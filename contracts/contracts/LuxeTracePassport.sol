// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LuxeTracePassport {
    enum PassportStatus {
        Issued,
        InTransfer,
        Received
    }

    enum OwnershipAction {
        Issued,
        Transferred
    }

    struct Passport {
        string itemCode;
        string itemName;
        string brandName;
        string metadataURI;
        bytes32 serialHash;
        address currentOwner;
        PassportStatus status;
        bool isAuthentic;
        uint256 issuedAt;
        bool exists;
    }

    struct OwnershipRecord {
        address actor;
        OwnershipAction action;
        address fromOwner;
        address toOwner;
        uint256 timestamp;
    }

    struct ServiceRecord {
        address actor;
        string serviceType;
        string metadataURI;
        uint256 timestamp;
    }

    mapping(string => Passport) private passports;
    mapping(string => OwnershipRecord[]) private ownershipHistory;
    mapping(string => ServiceRecord[]) private serviceHistory;
    string[] private issuedItemCodes;

    mapping(address => bool) private admins;
    mapping(address => bool) private issuers;
    mapping(address => bool) private serviceCenters;
    bool private publicDemoMode;

    event PassportIssued(
        string indexed itemCode,
        string itemName,
        string brandName,
        address indexed issuer,
        address indexed initialOwner
    );
    event OwnershipTransferred(
        string indexed itemCode,
        address indexed fromOwner,
        address indexed toOwner,
        PassportStatus newStatus
    );
    event ServiceRecorded(
        string indexed itemCode,
        string serviceType,
        address indexed serviceCenter
    );
    event RoleUpdated(
        string indexed role,
        address indexed account,
        bool enabled
    );

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier onlyIssuer() {
        require(issuers[msg.sender], "Only issuer can issue passports");
        _;
    }

    modifier onlyServiceCenter() {
        require(
            serviceCenters[msg.sender],
            "Only service center can record service"
        );
        _;
    }

    modifier passportExists(string memory itemCode) {
        require(passports[itemCode].exists, "Passport does not exist");
        _;
    }

    modifier onlyCurrentOwner(string memory itemCode) {
        require(
            passports[itemCode].currentOwner == msg.sender,
            "Only current owner can transfer this passport"
        );
        _;
    }

    modifier onlyPublicDemoMode() {
        require(publicDemoMode, "Public demo mode is disabled");
        _;
    }

    constructor(bool enablePublicDemoMode) {
        admins[msg.sender] = true;
        issuers[msg.sender] = true;
        serviceCenters[msg.sender] = true;
        publicDemoMode = enablePublicDemoMode;
    }

    function setIssuer(address account, bool enabled) external onlyAdmin {
        require(account != address(0), "Account is invalid");
        issuers[account] = enabled;
        emit RoleUpdated("ISSUER", account, enabled);
    }

    function setServiceCenter(
        address account,
        bool enabled
    ) external onlyAdmin {
        require(account != address(0), "Account is invalid");
        serviceCenters[account] = enabled;
        emit RoleUpdated("SERVICE_CENTER", account, enabled);
    }

    function isIssuer(address account) external view returns (bool) {
        return issuers[account];
    }

    function isServiceCenter(address account) external view returns (bool) {
        return serviceCenters[account];
    }

    function isPublicDemoMode() external view returns (bool) {
        return publicDemoMode;
    }

    function claimDemoIssuerRole() external onlyPublicDemoMode {
        issuers[msg.sender] = true;
        emit RoleUpdated("ISSUER", msg.sender, true);
    }

    function claimDemoServiceCenterRole() external onlyPublicDemoMode {
        serviceCenters[msg.sender] = true;
        emit RoleUpdated("SERVICE_CENTER", msg.sender, true);
    }

    function issuePassport(
        string memory itemCode,
        string memory itemName,
        string memory brandName,
        string memory metadataURI,
        bytes32 serialHash,
        address initialOwner
    ) external onlyIssuer {
        require(!_isEmpty(itemCode), "Item code is required");
        require(!_isEmpty(itemName), "Item name is required");
        require(!_isEmpty(brandName), "Brand name is required");
        require(!passports[itemCode].exists, "Passport already issued");
        require(serialHash != bytes32(0), "Serial hash is required");
        require(initialOwner != address(0), "Initial owner address is invalid");

        passports[itemCode] = Passport({
            itemCode: itemCode,
            itemName: itemName,
            brandName: brandName,
            metadataURI: metadataURI,
            serialHash: serialHash,
            currentOwner: initialOwner,
            status: PassportStatus.Issued,
            isAuthentic: true,
            issuedAt: block.timestamp,
            exists: true
        });
        issuedItemCodes.push(itemCode);

        ownershipHistory[itemCode].push(
            OwnershipRecord({
                actor: msg.sender,
                action: OwnershipAction.Issued,
                fromOwner: address(0),
                toOwner: initialOwner,
                timestamp: block.timestamp
            })
        );

        emit PassportIssued(itemCode, itemName, brandName, msg.sender, initialOwner);
    }

    function transferOwnership(
        string memory itemCode,
        address newOwner,
        PassportStatus newStatus
    ) external passportExists(itemCode) onlyCurrentOwner(itemCode) {
        require(newOwner != address(0), "New owner address is invalid");
        require(newOwner != msg.sender, "New owner must be different");
        require(
            newStatus == PassportStatus.InTransfer ||
                newStatus == PassportStatus.Received,
            "Status must be In Transfer or Received"
        );

        address previousOwner = passports[itemCode].currentOwner;
        passports[itemCode].currentOwner = newOwner;
        passports[itemCode].status = newStatus;

        ownershipHistory[itemCode].push(
            OwnershipRecord({
                actor: msg.sender,
                action: OwnershipAction.Transferred,
                fromOwner: previousOwner,
                toOwner: newOwner,
                timestamp: block.timestamp
            })
        );

        emit OwnershipTransferred(itemCode, previousOwner, newOwner, newStatus);
    }
    function addServiceRecord(
        string memory itemCode,
        string memory serviceType,
        string memory metadataURI
    ) external passportExists(itemCode) onlyServiceCenter {
        require(!_isEmpty(serviceType), "Service type is required");

        serviceHistory[itemCode].push(
            ServiceRecord({
                actor: msg.sender,
                serviceType: serviceType,
                metadataURI: metadataURI,
                timestamp: block.timestamp
            })
        );

        emit ServiceRecorded(itemCode, serviceType, msg.sender);
    }

    function getPassport(
        string memory itemCode
    ) external view passportExists(itemCode) returns (Passport memory) {
        return passports[itemCode];
    }

    function getOwnershipHistory(
        string memory itemCode
    )
        external
        view
        passportExists(itemCode)
        returns (OwnershipRecord[] memory)
    {
        return ownershipHistory[itemCode];
    }

    function getServiceHistory(
        string memory itemCode
    ) external view passportExists(itemCode) returns (ServiceRecord[] memory) {
        return serviceHistory[itemCode];
    }

    function getOwnedItemCodes(
        address owner
    ) external view returns (string[] memory) {
        if (owner == address(0)) {
            return new string[](0);
        }

        uint256 ownedCount = 0;

        for (uint256 i = 0; i < issuedItemCodes.length; i++) {
            if (passports[issuedItemCodes[i]].currentOwner == owner) {
                ownedCount++;
            }
        }

        string[] memory ownedItemCodes = new string[](ownedCount);
        uint256 writeIndex = 0;

        for (uint256 i = 0; i < issuedItemCodes.length; i++) {
            string memory itemCode = issuedItemCodes[i];

            if (passports[itemCode].currentOwner == owner) {
                ownedItemCodes[writeIndex] = itemCode;
                writeIndex++;
            }
        }

        return ownedItemCodes;
    }

    function _isEmpty(string memory value) private pure returns (bool) {
        return bytes(value).length == 0;
    }
}
