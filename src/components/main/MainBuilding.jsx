export default function MainBuilding({floors = 10}){
    const totalHeight = 665;

    // 10층 단위로 몇 칸을 만들지 계산
    const sectionCount = Math.ceil(floors / 10);

    // 각 층 높이 (px 단위)
    const floorHeight = totalHeight / sectionCount;


    return(
        <div className="w-[350px] h-[665px] bg-[url(./assets/imgs/building.png)] bg-cover bg-center">
            {Array.from({ length: floors }).map((_, idx) => (
                <div
                    key={idx}
                    className="border hover:bg-[#054E76] hover:opacity-50"
                    style={{ height: `${floorHeight}px` }}
                ></div>
            ))} 
        </div>
    );
}