$(document).ready(function(){
	max_x = 2;
	// Считаем максимальное количество Иксов
	$('#ogranichenie_block .ogranichenie').each(function(){
		var input_num = $(this).find('input').length -1;
		if (input_num>max_x)
			max_x = input_num;
	})

	$('.ogranichenie').show();
	
})
	// Добавляем Х
	$('a.add_x').live('click', function(){
		// Ограничили количество Иксов до 7
		if ($(this).parents('.virazhenie').find('input').length < 7){ // Ограничение можно снять или изменить
			if ($(this).parents('.uravnenie').length){
				var count_x = $(this).parents('.virazhenie').find('input').length +1;
				if (count_x > max_x)
					max_x = count_x;
			}else{
				var count_x = $(this).parents('.virazhenie').find('input').length;
				if (count_x > max_x){
					max_x = count_x;		
				}
				
			}
			$('.left_side').css('display', 'flex');
			$('.virazhenie').children('.left_side').append(' + <input type="text" class="new_params" value ="0" />x'+`<sub>${count_x}</sub> `);
			$('.new_params').show(500);
			$('.new_params').css('display', 'inline-block');
		}
		else {
			$('.add_x').css('display', 'none');
		}
		$('.left_side').css('display', 'initial');
		return false;
	})
	
	// Добавляем ограничение
	$('.ogranichenie_add').live('click', function(){
		var html_inputs = ' <input type="text" value ="0" />x<sub>1</sub>';
		for (var q = 2; q<=max_x;q++)
			html_inputs += ' + <input type="text" value ="0" />x'+`<sub>${q}</sub> `;
		var html_code = '<div class="ogranichenie virazhenie"><span class="left_side">'+html_inputs+'</span><span class="right_side"><select><option value="1">≤</option><option value="-1">≥</option><option value="1">=</option></select>'+' '+'<input type="text" value ="0" /></span></div>';		
		$('#ogranichenie_block').append(html_code);
		$('#ogranichenie_block .ogranichenie:hidden').slideDown(200);
		
		return false;
	})	

	$('.submit').live('click', function(){ 
	$('.simplex-form input').each(function() {
		try{
			if(!$.isNumeric(eval($(this).val()).toFixed(3))){
				isError();
			}
		}
		catch(e){
			isError();
		}
	});
	$('#result').html(' '); 
		var matrix = new Array();
		matrix = new Array();
		var i = 0;
	// Перебираем все ограничения
		$('#ogranichenie_block .ogranichenie').each(function(){
			matrix[i] = new Array();
			for (var j = 0; j < max_x + 1; j++) {
				if ($(this).find('input').eq(j).length && $(this).find('input').eq(j).val() ){
					var inp_val = (eval($(this).find('input').eq(j).val())).toFixed(3) * $(this).find('select').val();
				}else{
					var inp_val = 0;
				}
				matrix[i][j] = inp_val; // Матрица исходных значений
				
			}
			i++;
		})
	// Массив индексов по горизонтале
		horisont_x = new Array();
		for (i=0; i< max_x + 1; i++){
			horisont_x[i] = i;
		}
	// Массив индексов по вертикале
		vertical_x = new Array();
		for (i=0; i< $('#ogranichenie_block .ogranichenie').length; i++){
			vertical_x[i] = i + max_x;
		}		
	// Матрица свободных членов	
		var free = new Array();
		for (var k=0; k < matrix.length; k++){
			free[k] = matrix[k][max_x];
		}
		free[matrix.length] = 0;

	// Последняя строка сама функция
		Fun = new Array();
		for (var j = 0; j < matrix[0].length; j++) {
			if ($('.uravnenie .left_side').find('input').eq(j).length){
				var inp_val = $('.uravnenie .left_side').find('input').eq(j).val() * $('.uravnenie select').val();
			}else{
				var inp_val = 0;
			}
			Fun[j] = inp_val; // Матрица исходных значений
		}
	// Добавим ее в основную матрицу
		matrix.push(Fun); 
	
	// Есть ли  отрицательные элементы в матрице свободных членов ?
	if (minelm(free) < 0){ 
		iteration = 0;
		step1(); 
	}
	// Есть ли  отрицательные элементы в коэфициентах функции ?
	if (minelm(matrix[matrix.length-1], false, true) < 0){
		iteration = 0;
		step2();
	}
	swal("Результат выведен","" , "success");
	results(); 
	

function step1(){
		iteration++;
		// находим ведущую строку
		var min_k_num = minelm(free, true, true);
		
		// находим ведущий столбец		
		var min_k1 = minelm(free)
		if (minelm(matrix[min_k_num]) < 0){
			var min_k1_num = minelm(matrix[min_k_num], true, true);
		}else{
			swal('Условия задачи несовместны и решений у нее нет', 'error');
			return false;
		}
		// Обновляем индексы элементов по горизонтале и вертикале
		tmp = horisont_x[min_k1_num];
		horisont_x[min_k1_num] = vertical_x[min_k_num];
		vertical_x[min_k_num] = tmp;
	// Замена	
		update_matrix(min_k_num, min_k1_num);
	// матрица свободных членов
		for (var k=0; k < matrix.length; k++){
			free[k] = matrix[k][max_x];
		}
		
		if (minelm(free, false, true) < 0 && iteration < 10) 
			step1();
	
}



function step2(){
		iteration++;
		// находим ведущий столбец
		var min_col_num = minelm(matrix[matrix.length-1], true, true);
		
		// находим ведущую строку
		var cols_count = matrix[0].length -1;
		var min_row_num = 999;
		
		var min_row = 9999; 
		var tmp = 0;
		for (i = 0; i< matrix.length-1; i++){
			tmp = free[i]/matrix[i][min_col_num];
			if (tmp < min_row && tmp>=0){
				min_row_num = i;
				min_row = tmp;
			}
		}
	
		min_k1_num = min_col_num;
		min_k_num = min_row_num;

		// Обновляем индексы элементов по горизонтале и вертикале
		tmp = horisont_x[min_k1_num];
		horisont_x[min_k1_num] = vertical_x[min_k_num];
		vertical_x[min_k_num] = tmp;
		// Если мы не нашли ведущую строку
		if (min_row_num == 999){
			swal("Функция в области допустимых решений задачи не ограничена!", " ", "success");
			throw new Error('Функция в области допустимых решений задачи не ограничена!')
		}

	// Замена	
		update_matrix(min_k_num, min_k1_num);
	// матрица свободных членов
		for (var k=0; k < matrix.length; k++){
			free[k] = matrix[k][max_x];
		}
		

		if (minelm(matrix[matrix.length-1], false, true) < 0 && iteration < 10) 	
			step2();

}
// Функция замены (обновления матрицы)
function update_matrix(min_k_num, min_k1_num){

		var matrix1 = new Array();
	
		for (i = 0; i< matrix.length; i++){
			matrix1[i] = new Array()
			for (j = 0; j< matrix[0].length; j++){
				if (i == min_k_num && j ==min_k1_num){
					matrix1[i][j] = 1/matrix[i][j];
				}else{
					if (i == min_k_num){
						matrix1[i][j] = matrix[i][j] * 1/matrix[min_k_num][min_k1_num];
					}else{
						if (j == min_k1_num){
							matrix1[i][j] = -matrix[i][j] * 1/matrix[min_k_num][min_k1_num];
						}else{
							matrix1[i][j] = matrix[i][j] - matrix[i][min_k1_num]*matrix[min_k_num][j]/matrix[min_k_num][min_k1_num];
						}
					}
			
				}
				matrix1[i][j] = Math.round(matrix1[i][j]*1000)/1000;
			}
		}
		matrix = matrix1;

	return false;

}


	// Выводим результаты в понятном виде
	function results(){
		$('#result').append('<div class="result-data"></div>');
		var nulls = '';
		// Иксы, равные нулю
		for (i = 0; i< horisont_x.length-1;i++){
			if (horisont_x[i]<max_x)
				nulls += '<span class="result-arguments">'+'x'+`<sub>${(horisont_x[i]+1)}</sub>`+'=';
		}
		nulls +='0 <br /><br />'+'</span>';
		var vars ='';
		// Иксы, отличные от нуля
		for (i = 0; i< vertical_x.length;i++){
			if (vertical_x[i]<max_x)
				vars +='<span class="result-arguments">' + 'x'+ `<sub>${(vertical_x[i]+1)}</sub>`+'='+`${matrix[i][max_x]}`+'<br /></span>';
		}
		var main_result = '';
		// Минимум(максимум) функции
		if ($('.uravnenie select').val() > 0)
			main_result = '<span class="result-arguments">F<sub>min</sub> ='+`${matrix[matrix.length-1][max_x]*(-1)}</span>`;
		else
			main_result = '<span class="result-arguments">F<sub>max</sub> ='+`${matrix[matrix.length-1][max_x]}</span>`;
		$('.result-data').append(nulls+vars+'<br />'+main_result);
		$('#result').css('opacity', 1);
	}
	return false;
})
// Поиск минимального элемента
function minelm(v, dispnum, not_last){ 
    var m= v[0];
	var num= 0;
	var len=0;
	
	if (not_last){
		len = v.length-2;
	}else{
		len = v.length-1;
	}
    for (var i=1; i <= len; i++){ 
		if (v[i] < m ){
			m= v[i];
			num = i
		}
    }
	// Выводим номер минимального
	if (dispnum){
		return num
	}else{ 
		return m
	}
}

function isError() {
	swal("Ошибка", 'Проверьте введеные данные', "error");
	throw new Error('Проверьте введеные данные')
}