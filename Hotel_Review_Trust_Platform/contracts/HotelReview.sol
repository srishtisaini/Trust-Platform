pragma solidity ^0.4.2;

contract HotelReview{
    // Model a Hotel
    struct Hotel {
        uint id;
        uint reviewCount;
        uint reviewSum;
    }

    // Store Hotel
    // Fetch Hotel
    mapping(uint  => Hotel) public hotels;


    // Store users that have reviewed
    mapping(address => bool) public users;

    // Store Hotels Count
    uint public hotelsCount;

    // voted event
    event reviewEvent (
        uint indexed _id, uint _currentReview );

    function HotelReview () public {
        addHotel(1);
        addHotel(2);
        addHotel(3);
        addHotel(4);
        addHotel(5);
    }

    function addHotel (uint _id) private {
        hotelsCount ++;
        hotels[hotelsCount] = Hotel(_id,0,0);
    }


    function review (uint _id, uint _currentReview) public {
        //tring addr = msg.sender;
                // require that they haven't voted before
        

        require(!users[msg.sender]);

        // require a valid candidate
        //require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
    
        users[msg.sender] = true;

        // update candidate vote Count
        hotels[_id].reviewCount ++;
        hotels[_id].reviewSum = (hotels[_id].reviewSum  + _currentReview);

        //hotels[_id].avgReview = (_currentReview + hotels[_id].avgReview)/hotels[_id].reviewCount;
        //hotels[_id].reviewAverage = ( _currentReview + hotels[_id].reviewAverage ) / hotels[_id].reviewCount;

        // trigger voted event
        reviewEvent(_id, _currentReview);
    }
}
